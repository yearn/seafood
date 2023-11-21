import {BigNumber, ethers} from 'ethers';
import {ContractCallContext, ContractCallReturnContext, Multicall} from 'ethereum-multicall';
import {GetVaultAbi, LockedProfitDegradationField} from '../../../ethereum/EthHelpers';
import {aggregateRiskGroupTvls} from '../risk';
import config from '../../../config.json';
import * as abi from '../../../abi';
import * as Kong from '../types.kong';
import * as yDaemon from '../types.ydaemon';
import * as Seafood from '../types';
import {getChain, hydrateBigNumbersRecursively} from '../../../utils/utils';
import {Callback, StartOptions, RefreshStatus, StrategyMulticallUpdate, StrategyRewardsUpdate, TVLUpdates, Tradeable, VaultMulticallUpdate} from './types';
import merge from './merge';


export const api = {
	ahoy: () => `🐟 ahoy from useVaults worker ${new Date()}`,
	start,
	refresh,
	requestStatus,
	requestVaults,
	pushCallback,
	removeCallback,
	isRunning: async () => running,
	isRefreshing: async () => refreshing
};


const callbacks: Callback[] = [];
let running = false;
let refreshing = false;
let nextRefresh: number | undefined;
let refreshHandle: NodeJS.Timeout | undefined;

function pushCallback(callback: Callback) {
	const index = callbacks.indexOf(callback);
	if(index === -1) callbacks.push(callback);
}

function removeCallback(callback: Callback) {
	const index = callbacks.indexOf(callback);
	if(index !== -1) callbacks.splice(index, 1);
}

const workerCache = {
	prices: [] as {chainId: number, token: string, price: number}[],
	tradeFactories: [] as {
		chainId: number, 
		tradeFactory: string,
		tradeables: Tradeable[]
	}[],
};

function resetWorkerCache() {
	workerCache.prices = [];
	workerCache.tradeFactories = [];
}

async function requestStatus() {
	const status = await getAll<RefreshStatus[]>('status');
	callbacks.forEach(callback => callback.onStatus(status));
}

async function requestVaults() {
	const vaults = await getAll<Seafood.Vault[]>('vaults');
	sort(vaults);
	callbacks.forEach(callback => callback.onVaults(vaults));
}

async function start(options: StartOptions) {
	await resetStatus();
	running = true;
	nextRefresh = options.refreshInterval;
	await refresh();
}

async function refresh() {
	if(refreshHandle) clearTimeout(refreshHandle);

	refreshing = true;
	callbacks.forEach(callback => callback.onRefresh());
	resetWorkerCache();

	const latest = [] as Seafood.Vault[];
	const currentVaults = await getAll<Seafood.Vault[]>('vaults');

	// fetch fast data
	// const Xvaultverse = await fetchVaultverse();
	const vaultverse = await fetchKongUpdates();
	const tvlUpdates = await fetchTvlUpdates();

	for(const [index, chain] of config.chains.entries()) {
		latest.push(...(vaultverse[index] || []).map(vault => {
			const current = currentVaults.find(v => v.network.chainId === chain.id && v.address === vault.address);
			const update = {...current, ...vault} as Seafood.Vault;
			const tvls = tvlUpdates[chain.id][vault.address] || {tvls: [], dates: []};
			if(!tvls.tvls.length) {
				tvls.tvls = [0, 0, 0];
				tvls.dates = [0, 0, 0];
			}
			update.tvls = tvls;
			return update;
		}));
	}

	sort(latest);
	hydrateBigNumbersRecursively(latest);
	// aggregateRiskGroupTvls(latest);
	await putVaults(latest);
	await requestVaults();

	// fetch multicalls
	// const multicallUpdates = await fetchMulticallUpdates(vaultverse);
	// const strategies = latest.map(vault => vault.withdrawalQueue).flat();
	// for(const update of multicallUpdates) {
	// 	if(update.type === 'vault') {
	// 		const vault = latest.find(v =>
	// 			v.network.chainId === update.chainId 
	// 			&& v.address === update.address);
	// 		if(vault) {
	// 			vault.totalDebt = update.totalDebt;
	// 			vault.debtRatio = update.debtRatio;
	// 			vault.totalAssets = update.totalAssets;
	// 			vault.availableDepositLimit = update.availableDepositLimit;
	// 			vault.lockedProfitDegradation = update.lockedProfitDegradation;
	// 		}

	// 	} else if(update.type === 'strategy') {
	// 		const strategy = strategies.find(s => 
	// 			s.network.chainId === update.chainId
	// 			&& s.address === update.address);
	// 		if(strategy) {
	// 			strategy.lendStatuses = update.lendStatuses;
	// 			strategy.name = update.name;
	// 			strategy.tradeFactory = update.tradeFactory;
	// 		}
	// 	}
	// }

	// await putVaults(latest);
	// await requestVaults();

	// fetch rewards
	// const strategyRewardsUpdates = await fetchRewardsUpdates(multicallUpdates);
	// for(const [index, chain] of config.chains.entries()) {
	// 	const rewardsUpdates = strategyRewardsUpdates[index];

	// 	latest.filter(vault => vault.network.chainId === chain.id).forEach(vault => {
	// 		vault.withdrawalQueue.forEach(strategy => {
	// 			const update = rewardsUpdates.find(update => update.chainId === chain.id && update.address === strategy.address);
	// 			strategy.rewards = update?.rewards || [];
	// 		});

	// 		vault.rewardsUsd = vault.withdrawalQueue.map(s => s.rewards).flat()
	// 			.reduce((acc, reward) => acc + reward?.amountUsd, 0)
	// 			|| 0;
	// 	});
	// }

	markupWarnings(latest);
	await putVaults(latest);
	await requestVaults();

	refreshing = false;
	callbacks.forEach(callback => callback.onRefreshed(new Date()));
	refreshHandle = setTimeout(() => refresh(), nextRefresh);
}

async function getAll<T>(storeName: string) {
	return new Promise<T>(async (resolve, reject) => {
		const db = await openDb();
		const store = db.transaction(storeName, 'readonly').objectStore(storeName);
		const request = store.getAll();
		request.onerror = (e: Event) => reject(e);
		request.onsuccess = async () => {
			db.close();
			resolve(request.result as T);
		};
	});
}

async function resetStatus() {
	const status = await getAll<RefreshStatus[]>('status');
	const refreshing = status.filter(s => s.status === 'refreshing');
	for(const s of refreshing) await putStatus({...s, status: 'ok'});
	await requestStatus();
}

async function putStatus(status: RefreshStatus) { 
	return new Promise<void>(async (resolve, reject) => {
		const db = await openDb();
		const store = db.transaction('status', 'readwrite').objectStore('status');
		const request = store.put(status);
		request.onerror = (e: Event) => reject(e);
		request.onsuccess = async () => {
			db.close();
			await requestStatus();
			resolve();
		};
	});
}

async function putVaults(vaults: Seafood.Vault[]) {
	for(const vault of vaults) await putVault(vault);
}

async function putVault(vault: Seafood.Vault) {
	return new Promise<void>(async (resolve, reject) => {
		const db = await openDb();
		const store = db.transaction('vaults', 'readwrite').objectStore('vaults');
		const request = store.put(vault);
		request.onerror = (e: Event) => reject(e);
		request.onsuccess = async () => {
			db.close();
			resolve();
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

async function fetchVaultverse() : Promise<yDaemon.Vault[][]> {
	const result = [];
	for(const chain of config.chains) {
		const status = {status: 'refreshing', stage: 'ydaemon', chain: chain.id, timestamp: Date.now()} as RefreshStatus;
		await putStatus(status);
		const request = `${config.ydaemon.url}/${chain.id}/vaults/all?strategiesCondition=all&strategiesDetails=withDetails&strategiesRisk=withRisk`;
		try {
			result.push(await (await fetch(request)).json());
			await putStatus({...status, status: 'ok', timestamp: Date.now()});
		} catch(error) {
			await putStatus({...status, status: 'warning', error, timestamp: Date.now()});
		}
	}
	return result;
}

async function fetchMulticallUpdates(vaultverse: yDaemon.Vault[][]) {
	const result = [];
	for(const [index, chain] of config.chains.entries()) {
		const status = {status: 'refreshing', stage: 'multicall', chain: chain.id, timestamp: Date.now()} as RefreshStatus;
		await putStatus(status);

		const vaults = vaultverse[index];
		const multicallAddress = config.chains.find(c => c.id === chain.id)?.multicall;
		const multicall = new Multicall({ethersProvider: providerFor(chain), tryAggregate: true, multicallCustomContractAddress: multicallAddress});
		const promises = [] as Promise<VaultMulticallUpdate[] | StrategyMulticallUpdate[]>[];

		try {
			promises.push(...await createVaultMulticalls(vaults, chain, multicall));
			promises.push(...await createStrategyMulticalls(vaults, chain, multicall));
			result.push(...(await Promise.all(promises)).flat());
			await putStatus({...status, status: 'ok', timestamp: Date.now()});
		} catch(error) {
			await putStatus({...status, status: 'warning', error, timestamp: Date.now()});
		}
	}

	return result;
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
		vault.warnings = [];

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

const KONG_QUERY = `
query Vaults {
  vaults {
		chainId
		address
    name
		totalAssets
    totalDebt
    apiVersion
    symbol
    decimals
    availableDepositLimit
    lockedProfitDegradation
    debtRatio
    assetAddress
    assetSymbol
    assetName
    priceUsd
    managementFee
    performanceFee
		registryStatus
		governance
		activationBlockNumber
		withdrawalQueue {
      address
      healthCheck
      debtRatio
      delegatedAssets
      doHealthCheck
      estimatedTotalAssets
      grossApr
      keeper
      lastReportBlockTime
      netApr
      name
      performanceFee
      riskGroup
      totalDebt
      totalDebtUsd
      withdrawalQueueIndex
    }
    tvlUsd
    tvlSparkline {
      time
      value
    }
		apyNet
		apyWeeklyNet
		apyMonthlyNet
		apyInceptionNet
		aprGross
    apySparkline {
      time
      value
    }
  }
}
`;

async function fetchKongUpdates(): Promise<Seafood.Vault[][]> {
	if(!process.env.REACT_APP_KONG_API_URL) throw new Error('!process.env.REACT_APP_KONG_API_URL');

	const response = await fetch(process.env.REACT_APP_KONG_API_URL, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({query: KONG_QUERY})
	});

	if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

	const json = await response.json();
	if (json.error) throw new Error(json.error);

	const flat = json.data.vaults.map((kongVault: Kong.Vault) => ({
		address: kongVault.address,
		name: kongVault.name,
		price: kongVault.priceUsd,
		network: {
			chainId: kongVault.chainId,
			name: getChain(kongVault.chainId).name
		},
		version: kongVault.apiVersion,
		want: kongVault.assetAddress,
		token: {
			address: kongVault.assetAddress,
			name: kongVault.assetName,
			symbol: kongVault.assetSymbol,
			decimals: kongVault.decimals
		},
		endorsed: kongVault.registryStatus === 'endorsed',
		governance: kongVault.governance,
		totalAssets: BigNumber.from(kongVault.totalAssets),
		availableDepositLimit: kongVault.availableDepositLimit,
		lockedProfitDegradation: BigNumber.from(kongVault.lockedProfitDegradation || 0),
		totalDebt: kongVault.totalDebt,
		decimals: BigNumber.from(kongVault.decimals || 0),
		debtRatio: BigNumber.from(kongVault.debtRatio || 0),
		managementFee: BigNumber.from(kongVault.managementFee || 0),
		performanceFee: BigNumber.from(kongVault.performanceFee || 0),
		depositLimit: BigNumber.from(kongVault.availableDepositLimit || 0),
		activation: BigNumber.from(kongVault.activationBlockNumber || 0),
		apy: {
			type: 'apy',
			gross: kongVault.aprGross,
			net: kongVault.apyNet,
			[-7]: kongVault.apyWeeklyNet,
			[-30]: kongVault.apyMonthlyNet,
			inception: kongVault.apyInceptionNet
		},
		withdrawalQueue: kongVault.withdrawalQueue.map((kongStrategy: Kong.Strategy) => ({
			network: {
				chainId: kongVault.chainId,
				name: getChain(kongVault.chainId).name
			},
			address: kongStrategy.address,
			name: kongStrategy.name,
			description: '',
			risk: {
				tvl: 0,
				riskGroupId: kongStrategy.riskGroup || '',
				riskGroup: kongStrategy.riskGroup || '',
				riskScore: 0,
				riskDetails: {
					TVLImpact: 0,
					auditScore: 0,
					codeReviewScore: 0,
					complexityScore: 0,
					longevityImpact: 0,
					protocolSafetyScore: 0,
					teamKnowledgeScore: 0,
					testingScore: 0,
					median: 0
				},
				allocation: {
					availableAmount: '0',
					availableTVL: '0',
					currentAmount: '0',
					currentTVL: '0'
				}
			},
			debtRatio: BigNumber.from(kongStrategy.debtRatio || 0),
			performanceFee: BigNumber.from(kongStrategy.performanceFee || 0),
			estimatedTotalAssets: BigNumber.from(kongStrategy.estimatedTotalAssets || 0),
			delegatedAssets: BigNumber.from(kongStrategy.delegatedAssets || 0),
			lastReport: BigNumber.from(kongStrategy.lastReportBlockTime || 0),
			totalDebt: BigNumber.from(kongStrategy.totalDebt || 0),
			totalDebtUSD: kongStrategy.totalDebtUsd,
			totalGain: BigNumber.from(0),
			totalLoss: BigNumber.from(0),
			withdrawalQueuePosition: kongStrategy.withdrawalQueueIndex,
			lendStatuses: [] as Seafood.LendStatus[],
			healthCheck: kongStrategy.healthCheck,
			doHealthCheck: kongStrategy.doHealthCheck,
			tradeFactory: undefined,
			keeper: kongStrategy.keeper,
			rewards: [] as Seafood.Reward[],
		})),
	} as Seafood.Vault));

	flat.forEach((vault: Seafood.Vault) => {
		vault.strategies = [...vault.withdrawalQueue];
	});

	const result = [];
	for(const chain of config.chains) {
		result.push(flat.filter((vault: Seafood.Vault) => vault.network.chainId === chain.id));
	}
	return result;
}

async function fetchTvlUpdates() : Promise<TVLUpdates> {
	const status = {status: 'refreshing', stage: 'tvls', chain: 'all', timestamp: Date.now()} as RefreshStatus;
	await putStatus(status);
	try {
		const result = await (await fetch('/api/vision/tvls')).json() as TVLUpdates;
		await putStatus({...status, status: 'ok', timestamp: Date.now()});
		return result;
	} catch(error) {
		await putStatus({...status, status: 'warning', error, timestamp: Date.now()});
		const result = {} as TVLUpdates;
		config.chains.forEach(chain => result[chain.id] = {});
		return result;
	}
}

async function getTradeables(strategy: string, tradeFactory: string, chain: Seafood.Chain) {
	let tradeables = workerCache.tradeFactories.find(t => t.chainId === chain.id && t.tradeFactory === tradeFactory)?.tradeables;
	if(!tradeables) {
		tradeables = await (await fetch(`/api/tradeables/?chainId=${chain.id}&tradeFactory=${tradeFactory}`)).json() as Tradeable[];
		workerCache.tradeFactories.push({chainId: chain.id, tradeFactory, tradeables});
	}
	return tradeables.filter(t => t.strategy === strategy) as Tradeable[];
}

async function getPrice(token: string, chain: Seafood.Chain) {
	let price = workerCache.prices.find(p => p.chainId === chain.id && p.token === token)?.price;
	if(!price) {
		const request = `${config.ydaemon.url}/${chain.id}/prices/${token}?humanized=true`;
		price = parseFloat(await (await fetch(request)).text());
		workerCache.prices.push({chainId: chain.id, token, price});
	}
	return price;
}

async function fetchRewardsUpdates(multicallUpdates: (VaultMulticallUpdate|StrategyMulticallUpdate)[]) 
: Promise<StrategyRewardsUpdate[][]> {
	const result = [] as StrategyRewardsUpdate[][];
	for(const chain of config.chains) {
		const status = {status: 'refreshing', stage: 'rewards', chain: chain.id, timestamp: Date.now()} as RefreshStatus;
		await putStatus(status);
		try {
			const updates = await fetchRewards(multicallUpdates, chain);
			result.push(updates);
			await putStatus({...status, status: 'ok', timestamp: Date.now()});
		} catch(error) {
			result.push([]);
			await putStatus({...status, status: 'warning', error, timestamp: Date.now()});
		}
	}
	return result;
}

async function fetchRewards(multicallUpdates: (VaultMulticallUpdate|StrategyMulticallUpdate)[], chain: Seafood.Chain) {
	const strategyUpdates = multicallUpdates.filter(u => u.chainId === chain.id && u.type === 'strategy' && u.tradeFactory) as StrategyMulticallUpdate[];
	const multicallAddress = config.chains.find(c => c.id === chain.id)?.multicall;
	const multicall = new Multicall({ethersProvider: providerFor(chain), tryAggregate: true, multicallCustomContractAddress: multicallAddress});
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
