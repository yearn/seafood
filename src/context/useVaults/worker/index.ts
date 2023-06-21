declare const self: SharedWorkerGlobalScope; // chrome://inspect/#workers
import * as Comlink from 'comlink';
import {BigNumber, ethers} from 'ethers';
import {ContractCallContext, ContractCallReturnContext, Multicall} from 'ethereum-multicall';
import {GetVaultAbi, LockedProfitDegradationField} from '../../../ethereum/EthHelpers';
import {aggregateRiskGroupTvls} from '../risk';
import config from '../../../config.json';
import * as abi from '../../../abi';
import * as yDaemon from '../types.ydaemon';
import * as Seafood from '../types';
import deepMerge from '../../../utils/deepMerge';
import {hydrateBigNumbersRecursively} from '../../../utils/utils';


export const api = {
	ahoy: () => `🐟 ahoy from useVaults worker ${new Date()}`,
	start,
	refresh
};

Comlink.expose(api);


interface IStartOptions {
	refreshInterval: number
}

interface ICallbacks {
	startRefresh?: () => void,
	cacheReady?: (date: Date, vaults: Seafood.Vault[], status: SyncStatus[]) => void
}

export interface SyncStatus {
	status: 'ok' | 'warning'
	stage: 'ydaemon' | 'multicall' | 'tvls' | 'rewards',
	chain: number | 'all',
	error?: unknown,
	timestamp: number
}

interface Tradeable {
	strategy: string,
	token: string,
	name: string,
	symbol: string,
	decimals: number
}

const cache = {
	prices: [] as {chainId: number, token: string, price: number}[],
	tradeFactories: [] as {
		chainId: number, 
		tradeFactory: string,
		tradeables: Tradeable[]
	}[],
};

function resetCache() {
	cache.prices = [];
	cache.tradeFactories = [];
}

async function start(options: IStartOptions, callbacks?: ICallbacks) {
	const {vaults, status} = await getVaultsAndStatus();
	if(vaults.length > 0 && callbacks?.cacheReady) callbacks.cacheReady(new Date(), vaults, status);
	await refresh(callbacks);
	setInterval(async () => {
		await refresh(callbacks);
	}, options.refreshInterval);
}

async function refresh(callbacks?: ICallbacks) {
	if(callbacks?.startRefresh) callbacks.startRefresh();
	resetCache();

	const latest = [] as Seafood.Vault[];
	let db = await openDb();
	const snapshot = {
		vaults: await getStore<Seafood.Vault[]>(db, 'vaults')
	};
	db.close();

	// get fast data from ydaemon and yvision
	const {result: vaultverse, status: vaultStatus} = await fetchVaultverse();
	const {result: tvlUpdates, status: tvlStatus} = await fetchTvlUpdates();

	for(const [index, chain] of config.chains.entries()) {
		latest.push(...(vaultverse[index] || []).map(vault => {
			const current = snapshot.vaults.find(v => v.network.chainId === chain.id && v.address === vault.address);
			const fresh = Seafood.parseVault(vault, chain, tvlUpdates[chain.id][vault.address]);
			const update = deepMerge(current || Seafood.defaultVault, fresh) as Seafood.Vault;
			return update;
		}));
	}
	sort(latest);
	hydrateBigNumbersRecursively(latest);
	markupWarnings(latest);
	aggregateRiskGroupTvls(latest);

	{
		db = await openDb();

		const store = {
			vaults: db.transaction('vaults', 'readwrite').objectStore('vaults'),
			status: db.transaction('status', 'readwrite').objectStore('status')
		};
	
		for(const vault of latest) {
			store.vaults.put(vault);
		}
	
		for(const status of vaultStatus) {
			store.status.put(status);
		}
	
		store.status.put(tvlStatus);
	
		if(callbacks?.cacheReady) {
			callbacks.cacheReady(new Date(), latest, await getStore<SyncStatus[]>(db, 'status'));
		}
	
		db.close();
		console.log('sync fast sources done');
	}

	// get multicall data
	const {result: multicallUpdates, status: multicallStatus} = await fetchMulticallUpdates(vaultverse);
	const strategies = latest.map(vault => vault.withdrawalQueue).flat();
	for(const update of multicallUpdates) {
		if(update.type === 'vault') {
			const vault = latest.find(v =>
				v.network.chainId === update.chainId 
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
				s.network.chainId === update.chainId
				&& s.address === update.address);
			if(strategy) {
				strategy.lendStatuses = update.lendStatuses;
				strategy.name = update.name;
				strategy.tradeFactory = update.tradeFactory;
			}
		}
	}

	{
		db = await openDb();

		const store = {
			vaults: db.transaction('vaults', 'readwrite').objectStore('vaults'),
			status: db.transaction('status', 'readwrite').objectStore('status')
		};
	
		for(const vault of latest) {
			store.vaults.put(vault);
		}
	
		for(const status of multicallStatus) {
			store.status.put(status);
		}
	
		if(callbacks?.cacheReady) {
			callbacks.cacheReady(new Date(), latest, await getStore<SyncStatus[]>(db, 'status'));
		}
	
		db.close();
		console.log('sync multicalls done');
	}

	// get rewards data
	const {result: strategyRewardsUpdates, status: rewardsStatus} = await fetchRewardsUpdates(multicallUpdates);
	for(const [index, chain] of config.chains.entries()) {
		const rewardsUpdates = strategyRewardsUpdates[index];
		rewardsUpdates.forEach(update => {
			const strategy = strategies.find(s => 
				s.network.chainId === chain.id 
				&& s.address === update.address);
			if(strategy) strategy.rewards = update.rewards;
		});

		latest.forEach(vault => {
			vault.rewardsUsd = vault.withdrawalQueue.map(s => s.rewards).flat()
				.reduce((acc, reward) => acc + reward?.amountUsd, 0);
		});
	}

	{
		db = await openDb();

		const store = {
			vaults: db.transaction('vaults', 'readwrite').objectStore('vaults'),
			status: db.transaction('status', 'readwrite').objectStore('status')
		};
	
		for(const vault of latest) {
			store.vaults.put(vault);
		}
	
		for(const status of rewardsStatus) {
			store.status.put(status);
		}
	
		if(callbacks?.cacheReady) {
			callbacks.cacheReady(new Date(), latest, await getStore<SyncStatus[]>(db, 'status'));
		}
	
		db.close();
		console.log('sync rewards done');
	}
}

async function getVaultsAndStatus() {
	const db = await openDb();
	const vaults = await getStore<Seafood.Vault[]>(db, 'vaults');
	const status = await getStore<SyncStatus[]>(db, 'status');
	db.close();
	sort(vaults);
	return {vaults, status};
}

async function getStore<T>(db: IDBDatabase | null, storeName: string) {
	return new Promise<T>(async (resolve, reject) => {
		const closeDb = db === null ? true : false;
		if(db === null) db = await openDb();
		const store = db.transaction(storeName, 'readonly').objectStore(storeName);
		const request = store.getAll();
		request.onerror = (e: Event) => reject(e);
		request.onsuccess = async () => {
			if(closeDb) db?.close();
			resolve(request.result as T);
		};
	});
}

async function sort(vaults: Seafood.Vault[]) {
	vaults.sort((a, b) => {
		const aTvl = a.tvls ? a.tvls.tvls.slice(-1)[0] : 0;
		const bTvl = b.tvls ? b.tvls.tvls.slice(-1)[0] : 0;
		return bTvl - aTvl;
	});
}

const DB_VERSION = 3;
async function openDb() {
	return new Promise<IDBDatabase>((resolve, reject) => {
		const dbRequest = self.indexedDB.open('seafood', DB_VERSION);
		dbRequest.onerror = (e: Event) => reject(e);
		dbRequest.onupgradeneeded = async (event: IDBVersionChangeEvent) => {
			if(!event.newVersion) return;

			if(event.oldVersion === 0) {
				dbRequest.result.createObjectStore('vaults', {keyPath: ['network.chainId', 'address']});
				dbRequest.result.createObjectStore('status', {keyPath: ['stage', 'chain']});
			} else if(event.oldVersion === 1) {
				dbRequest.result.createObjectStore('status', {keyPath: ['stage', 'chain']});
			}
		};
		dbRequest.onsuccess = () => {
			waitForAllTransactions(dbRequest.result).then(() => {
				resolve(dbRequest.result);
			}).catch(e => reject(e));
		};
	});
}

function waitForAllTransactions(db: IDBDatabase): Promise<void> {
	return new Promise((resolve) => {
		const promises: Promise<void>[] = [];
		for (const storeName of db.objectStoreNames) {
			const store = db.transaction(storeName, 'readonly').objectStore(storeName);
			const promise = new Promise<void>((resolve) => {
				store.transaction.oncomplete = () => {
					resolve();
				};
			});
			promises.push(promise);
		}
		Promise.all(promises).then(() => resolve());
	});
}

async function fetchVaultverse() : Promise<{result: yDaemon.Vault[][], status: SyncStatus[]}> {
	const result = [], status = [];
	for(const chain of config.chains) {
		const request = `${config.ydaemon.url}/${chain.id}/vaults/all?strategiesCondition=all&strategiesDetails=withDetails&strategiesRisk=withRisk`;
		try {
			result.push(await (await fetch(request)).json());
			status.push({status: 'ok', stage: 'ydaemon', chain: chain.id, timestamp: Date.now()} as SyncStatus);
		} catch(error) {
			status.push({status: 'warning', stage: 'ydaemon', chain: chain.id, error, timestamp: Date.now()} as SyncStatus);
		}
	}
	return {result, status};
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
	lendStatuses: Seafood.LendStatus[] | undefined,
	tradeFactory: string | undefined
}

interface StrategyRewardsUpdate {
	readonly type: 'rewards',
	chainId: number,
	address: string,
	rewards: Seafood.Reward[]
}

async function fetchMulticallUpdates(vaultverse: yDaemon.Vault[][]) {
	const result = [], status = [];
	for(const [index, chain] of config.chains.entries()) {
		const vaults = vaultverse[index];
		const multicall = new Multicall({ethersProvider: providerFor(chain), tryAggregate: true});
		const promises = [] as Promise<VaultMulticallUpdate[] | StrategyMulticallUpdate[]>[];
		try {
			promises.push(...await createVaultMulticalls(vaults, chain, multicall));
			promises.push(...await createStrategyMulticalls(vaults, chain, multicall));
			result.push(...(await Promise.all(promises)).flat());
			status.push({status: 'ok', stage: 'multicall', chain: chain.id, timestamp: Date.now()} as SyncStatus);
		} catch(error) {
			status.push({status: 'warning', stage: 'multicall', chain: chain.id, error, timestamp: Date.now()} as SyncStatus);
		}
	}
	return {result, status};
}

function providerFor(chain: Seafood.Chain) {
	return new ethers.providers.JsonRpcProvider(chain.providers[0], {name: chain.name, chainId: chain.id});
}

async function batchMulticalls(multicall: Multicall, calls: ContractCallContext[]) {
	const size = 100;
	let result = {} as { [key: string]: ContractCallReturnContext };
	for(let start = 0; start < calls.length; start = start + size) {
		const end = calls.length > start + size ? start + size : undefined;
		const results = (await multicall.call(calls.slice(start, end))).results;
		result = {...result, ...results};
	}
	return result;
}

async function createVaultMulticalls(vaults: yDaemon.Vault[], chain: Seafood.Chain, multicall: Multicall) {
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
		const multiresults = await batchMulticalls(multicall, vaultMulticalls);
		vaults.forEach(vault => {
			const results = multiresults[vault.address].callsReturnContext;
			const lockedProfitDegradation = results[4].returnValues[0] && results[4].returnValues[0].type === 'BigNumber'
				? BigNumber.from(results[4].returnValues[0])
				: ethers.constants.Zero;
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

async function createStrategyMulticalls(vaults: yDaemon.Vault[], chain: Seafood.Chain, multicall: Multicall) {
	const result = [];
	const strategies = vaults.map(vault => vault.strategies).flat();

	const strategyMulticalls = strategies.map(strategy => ({
		reference: strategy.address,
		contractAddress: strategy.address,
		abi: abi.strategy,
		calls: [
			{reference: 'lendStatuses', methodName: 'lendStatuses', methodParameters: []},
			{reference: 'name', methodName: 'name', methodParameters: []},
			{reference: 'tradeFactory', methodName: 'tradeFactory', methodParameters: []}
		]
	}));

	result.push((async () => {
		const parsed = [] as StrategyMulticallUpdate[];
		const multiresults = await batchMulticalls(multicall, strategyMulticalls);
		strategies.forEach(strategy => {
			const results = multiresults[strategy.address].callsReturnContext;

			const lendStatuses = results[0].returnValues?.length > 0 
				? results[0].returnValues.map(tuple => ({
					name: tuple[0],
					deposits: BigNumber.from(tuple[1]),
					apr: BigNumber.from(tuple[2]),
					address: tuple[3]
				})) : undefined;

			const tradeFactory = results[2].returnValues[0] === ethers.constants.AddressZero 
				? undefined : results[2].returnValues[0];

			parsed.push({
				type: 'strategy',
				chainId: chain.id,
				address: strategy.address,
				lendStatuses,
				name: results[1].returnValues[0] || strategy.name,
				tradeFactory
			});
		});
		return parsed;
	})());

	return result;
}

function markupWarnings(vaults: Seafood.Vault[]) {
	vaults.forEach(vault => {
		if(vault.depositLimit.eq(0)) {
			vault.warnings.push({key: 'noDepositLimit', message: 'This vault cannot take deposits until its limit is raised.'});
		}

		vault.withdrawalQueue.forEach(strategy => {
			if(!strategy.healthCheck || strategy.healthCheck === ethers.constants.AddressZero) {
				vault.warnings.push({key: 'noHealthCheck', message: `No health check set on ${strategy.name}`});
			}
		});
	});
}

interface TVLUpdates {
	[chainId: number]: {
		[vaultAddress: string] : Seafood.TVLHistory
	}
}

async function fetchTvlUpdates() : Promise<{result: TVLUpdates, status: SyncStatus}> {
	try {
		return  {
			result: await (await fetch('/api/vision/tvls')).json(),
			status: {status: 'ok', stage: 'tvls', chain: 'all', timestamp: Date.now()}
		};
	} catch(error) {
		return  {
			result: [],
			status: {status: 'warning', stage: 'tvls', chain: 'all', error, timestamp: Date.now()}
		};
	}
}

async function getTradeables(strategy: string, tradeFactory: string, chain: Seafood.Chain) {
	let tradeables = cache.tradeFactories.find(t => t.chainId === chain.id && t.tradeFactory === tradeFactory)?.tradeables;
	if(!tradeables) {
		tradeables = await (await fetch(`/api/tradeables/?chainId=${chain.id}&tradeFactory=${tradeFactory}`)).json() as Tradeable[];
		cache.tradeFactories.push({chainId: chain.id, tradeFactory, tradeables});
	}
	return tradeables.filter(t => t.strategy === strategy) as Tradeable[];
}

async function getPrice(token: string, chain: Seafood.Chain) {
	let price = cache.prices.find(p => p.chainId === chain.id && p.token === token)?.price;
	if(!price) {
		const request = `${config.ydaemon.url}/${chain.id}/prices/${token}?humanized=true`;
		price = parseFloat(await (await fetch(request)).text());
		cache.prices.push({chainId: chain.id, token, price});
	}
	return price;
}

async function fetchRewardsUpdates(multicallUpdates: (VaultMulticallUpdate|StrategyMulticallUpdate)[]) 
: Promise<{result: StrategyRewardsUpdate[][], status: SyncStatus[]}> {
	const result = [] as StrategyRewardsUpdate[][], status = [] as SyncStatus[];
	for(const chain of config.chains) {
		try {
			const updates = await fetchRewards(multicallUpdates, chain);
			result.push(updates);
			status.push({status: 'ok', stage: 'rewards', chain: chain.id, timestamp: Date.now()} as SyncStatus);
		} catch(error) {
			result.push([]);
			status.push({status: 'warning', stage: 'rewards', chain: chain.id, error, timestamp: Date.now()} as SyncStatus);
		}
	}
	return {result, status};
}

async function fetchRewards(multicallUpdates: (VaultMulticallUpdate|StrategyMulticallUpdate)[], chain: Seafood.Chain) {
	const strategyUpdates = multicallUpdates.filter(u => u.chainId === chain.id && u.type === 'strategy' && u.tradeFactory) as StrategyMulticallUpdate[];
	const multicall = new Multicall({ethersProvider: providerFor(chain), tryAggregate: true});
	const balanceMulticalls = [];

	for(const strategyUpdate of strategyUpdates) {
		const tradeables = await getTradeables(strategyUpdate.address, strategyUpdate.tradeFactory as string, chain);
		balanceMulticalls.push(...tradeables.map(tradeable => ({
			reference: `${tradeable.token}/${strategyUpdate.address}`,
			contractAddress: tradeable.token,
			abi: abi.erc20,
			calls: [{reference: 'balanceOf', methodName: 'balanceOf', methodParameters: [strategyUpdate.address]}]
		})));
	}

	const balanceResults = await batchMulticalls(multicall, balanceMulticalls);

	const udpates = [] as StrategyRewardsUpdate[];
	for(const strategyUpdate of strategyUpdates) {
		const strategy = strategyUpdate.address;
		const tradeFactory = strategyUpdate.tradeFactory;
		const tradeables = await getTradeables(strategy, tradeFactory as string, chain);

		const rewards = [] as Seafood.Reward[];
		for(const tradeable of tradeables) {
			const amount = BigNumber.from(balanceResults[`${tradeable.token}/${strategyUpdate.address}`].callsReturnContext[0].returnValues[0]);
			let amountUsd = 0;

			if(amount.gt(0)) {
				let price = await getPrice(tradeable.token, chain);
				if(Number.isNaN(price)) {
					console.warn('price NaN', chain.id, strategy, tradeable.token, tradeable.name, tradeable.symbol);
					price = 0;
				}
				amountUsd = price * (amount.mul(10_000).div(BigNumber.from(10).pow(tradeable.decimals)).toNumber() / 10_000);
			}

			rewards.push({
				token: tradeable.token,
				name: tradeable.name,
				symbol: tradeable.symbol,
				decimals: tradeable.decimals,
				amount,
				amountUsd
			});
		}

		udpates.push({
			type: 'rewards',
			chainId: chain.id,
			address: strategy,
			rewards
		});
	}

	return udpates;
}

export default {} as typeof Worker & { new (): Worker };
