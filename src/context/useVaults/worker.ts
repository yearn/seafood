declare const self: SharedWorkerGlobalScope; // chrome://inspect/#workers
import * as Comlink from 'comlink';
import {BigNumber, ethers} from 'ethers';
import {Multicall} from 'ethereum-multicall';
import {GetVaultAbi, LockedProfitDegradationField} from '../../ethereum/EthHelpers';
import config from '../../config.json';
import * as abi from '../../abi';
import * as yDaemon from './types.ydaemon';
import * as ySeafood from './types';


export const api = {
	ahoy: () => `🐟 ahoy from useVaults worker ${new Date()}`,
	start,
	refresh
};

Comlink.expose(api);


export interface IStartOptions {
	refreshInterval: number
}

export interface ICallbacks {
	startRefresh?: () => void,
	cacheReady?: (date: Date, vaults: ySeafood.Vault[]) => void
}

async function start(options: IStartOptions, callbacks?: ICallbacks) {
	const vaults = await getCache();
	if(vaults.length > 0 && callbacks?.cacheReady) callbacks.cacheReady(new Date(), vaults);
	refresh(callbacks);
	setInterval(() => {
		refresh(callbacks);
	}, options.refreshInterval);
}

async function refresh(callbacks?: ICallbacks) {
	if(callbacks?.startRefresh) callbacks.startRefresh();
	const vaultverse = await fetchVaultverse();
	const multicallUpdates = await fetchMulticallUpdates(vaultverse);
	const tvlverse = await fetchTvlVerse();
	const vaults = merge(vaultverse, multicallUpdates, tvlverse);
	const db = await openDb();
	const vaultStore = db.transaction('vaults', 'readwrite').objectStore('vaults');
	const clearRequest = vaultStore.clear();
	clearRequest.onerror = (e: Event) => { throw e; };
	clearRequest.onsuccess = () => {
		vaults.forEach(vault => vaultStore.add(vault));
		if(callbacks?.cacheReady) {
			sort(vaults);
			callbacks.cacheReady(new Date(), vaults);
		}
	};
}

async function getCache() : Promise<ySeafood.Vault[]> {
	return new Promise<ySeafood.Vault[]>(async (resolve, reject) => {
		const db = await openDb();
		const vaultStore = db.transaction('vaults', 'readonly').objectStore('vaults');
		const request = vaultStore.getAll();
		request.onerror = (e: Event) => reject(e);
		request.onsuccess = async () => {
			if(request.result.length > 0) {
				const cache = request.result as ySeafood.Vault[];
				sort(cache);
				resolve(cache);
			} else {
				resolve([]);
			}
		};
	});	
}

async function sort(vaults: ySeafood.Vault[]) {
	vaults.sort((a, b) => {
		const aTvl = a.tvls ? a.tvls.tvls.slice(-1)[0] : 0;
		const bTvl = b.tvls ? b.tvls.tvls.slice(-1)[0] : 0;
		return bTvl - aTvl;
	});
}

async function openDb() {
	return new Promise<IDBDatabase>((resolve, reject) => {
		const dbRequest = self.indexedDB.open('seafood');
		dbRequest.onerror = (e: Event) => reject(e);
		dbRequest.onupgradeneeded = () => {
			dbRequest.result.createObjectStore('vaults', {keyPath: ['network.chainId', 'address']});
		};
		dbRequest.onsuccess = () => resolve(dbRequest.result);
	});
}

function merge(
	vaultverse: yDaemon.Vault[][], 
	multicallUpdates: (VaultMulticallUpdate|StrategyMulticallUpdate)[],
	tvlverse: TVLVerse
){
	const result = [];
	for(const [index, chain] of config.chains.entries()) {
		const vaults = vaultverse[index]?.map(vault => ySeafood.parseVault(vault, chain, tvlverse[chain.id][vault.address]));
		const strategies = vaults.map(vault => vault.withdrawalQueue).flat();
		const updates = multicallUpdates.filter(u => u.chainId === chain.id);
		updates.forEach(update => {
			if(update.type === 'vault') {
				const vault = vaults.find(v => 
					v.network.chainId === chain.id 
					&& v.address === update.address);
				if(vault) {
					vault.totalDebt = update.totalDebt;
					vault.debtRatio = update.debtRatio;
					vault.totalAssets = update.totalAssets;
					vault.availableDepositLimit = update.availableDepositLimit;
					vault.lockedProfitDegradation = update.lockedProfitDegradation;
				}

			} else if(update.type === 'strategy') {
				const strategy = strategies.find(s => 
					s.network.chainId === chain.id 
					&& s.address === update.address);
				if(strategy) {
					strategy.lendStatuses = update.lendStatuses;
					strategy.name = update.name;
				}

			}
		});
		result.push(...vaults);
	}
	return result;
}

async function fetchVaultverse() : Promise<yDaemon.Vault[][]> {
	const requests = config.chains.map(({id}) => 
		`${config.ydaemon.url}/${id}/vaults/all?strategiesCondition=all&strategiesDetails=withDetails`
	);
	const result = [];
	for(const request of requests) result.push(await ((await fetch(request)).json()));
	return result;
}

interface VaultMulticallUpdate {
	readonly type: 'vault',
	chainId: number,
	address: string,
	totalDebt: BigNumber,
	debtRatio: BigNumber | undefined,
	totalAssets: BigNumber | undefined,
	availableDepositLimit: BigNumber,
	lockedProfitDegradation: BigNumber
}

interface StrategyMulticallUpdate {
	readonly type: 'strategy',
	chainId: number,
	address: string,
	name: string,
	lendStatuses: ySeafood.LendStatus[] | undefined
}

async function fetchMulticallUpdates(vaultverse: yDaemon.Vault[][]) {
	const multicallPromises = [] as Promise<VaultMulticallUpdate[] | StrategyMulticallUpdate[]>[];
	for(const [index, chain] of config.chains.entries()) {
		const vaults = vaultverse[index];
		const multicall = new Multicall({ethersProvider: providerFor(chain), tryAggregate: true});
		multicallPromises.push(...await createVaultMulticalls(vaults, chain, multicall));
		multicallPromises.push(...await createStrategyMulticalls(vaults, chain, multicall));
	}
	return (await Promise.all(multicallPromises)).flat();
}

function providerFor(chain: ySeafood.Chain) {
	return new ethers.providers.JsonRpcProvider(chain.providers[0], {name: chain.name, chainId: chain.id});
}

async function createVaultMulticalls(vaults: yDaemon.Vault[], chain: ySeafood.Chain, multicall: Multicall) {
	const result = [];

	const vaultMulticalls = vaults.map(vault => ({
		reference: vault.address,
		contractAddress: vault.address,
		abi: GetVaultAbi(vault.version),
		calls: [
			{reference: 'totalDebt', methodName: 'totalDebt', methodParameters: []},
			{reference: 'debtRatio', methodName: 'debtRatio', methodParameters: []},
			{reference: 'totalAssets', methodName: 'totalAssets', methodParameters: []},
			{reference: 'availableDepositLimit', methodName: 'availableDepositLimit', methodParameters: []},
			{reference: 'lockedProfitDegradation', methodName: LockedProfitDegradationField(vault.version), methodParameters: []}
		]
	}));

	result.push((async () : Promise<VaultMulticallUpdate[]> => {
		const parsed = [] as VaultMulticallUpdate[];
		const multiresults = await multicall.call(vaultMulticalls);
		vaults.forEach(vault => {
			const results = multiresults.results[vault.address].callsReturnContext;
			const lockedProfitDegradation = results[4].returnValues[0] && results[4].returnValues[0].type === 'BigNumber'
				? BigNumber.from(results[4].returnValues[0])
				: BigNumber.from(0);
			parsed.push({
				type: 'vault',
				chainId: chain.id,
				address: vault.address,
				totalDebt: BigNumber.from(results[0].returnValues[0]),
				debtRatio: results[1].returnValues[0] ? BigNumber.from(results[1].returnValues[0]) : undefined,
				totalAssets: results[2].returnValues[0] ? BigNumber.from(results[2].returnValues[0]) : undefined,
				availableDepositLimit: BigNumber.from(results[3].returnValues[0]),
				lockedProfitDegradation
			});
		});
		return parsed;
	})());

	return result;
}

async function createStrategyMulticalls(vaults: yDaemon.Vault[], chain: ySeafood.Chain, multicall: Multicall) {
	const result = [];
	const strategies = vaults.map(vault => vault.strategies).flat();

	const strategyMulticalls = strategies.map(strategy => ({
		reference: strategy.address,
		contractAddress: strategy.address,
		abi: abi.strategy,
		calls: [
			{reference: 'lendStatuses', methodName: 'lendStatuses', methodParameters: []},
			{reference: 'name', methodName: 'name', methodParameters: []}
		]
	}));

	result.push((async () => {
		const parsed = [] as StrategyMulticallUpdate[];
		const multiresults = await multicall.call(strategyMulticalls);
		strategies.forEach(strategy => {
			const results = multiresults.results[strategy.address].callsReturnContext;

			const lendStatuses = results[0].returnValues?.length > 0 
				? results[0].returnValues.map(tuple => ({
					name: tuple[0],
					deposits: BigNumber.from(tuple[1]),
					apr: BigNumber.from(tuple[2]),
					address: tuple[3]
				})) : undefined;

			parsed.push({
				type: 'strategy',
				chainId: chain.id,
				address: strategy.address,
				lendStatuses,
				name: results[1].returnValues[0] || strategy.name
			});
		});
		return parsed;
	})());

	return result;
}

interface TVLVerse {
	[chainId: number]: {
		[vaultAddress: string] : ySeafood.ITVLHistory
	}
}

async function fetchTvlVerse() : Promise<TVLVerse> {
	return await (await fetch('/api/vision/tvls')).json();
}

export default {} as typeof Worker & { new (): Worker };
