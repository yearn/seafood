import {BigNumber, ethers} from 'ethers';
import {ContractCallContext, ContractCallReturnContext, Multicall} from 'ethereum-multicall';
import {aggregateRiskGroupTvls, computeLongevityScore, medianExlcudingTvlImpact} from '../risk';
import config from '../../../config.json';
import * as abi from '../../../abi';
import * as yDaemon from '../types.ydaemon';
import * as Kong from '../types.kong';
import * as Seafood from '../types';
import {getChain, hydrateBigNumbersRecursively, kabobCase} from '../../../utils/utils';
import {Callback, StartOptions, RefreshStatus, StrategyRewardsUpdate, TVLUpdates, Tradeable, VaultMulticallUpdate, StrategyMulticallUpdate} from './types';
import {GetVaultAbi, LockedProfitDegradationField} from '../../../ethereum/EthHelpers';
import merge from './merge';
const USE_KONG = process.env.REACT_APP_USE_KONG === 'true';


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

	const vaultverse = USE_KONG
		? await fetchKongVaults()
		: await fetchYDaemonVaults();

	const tvlUpdates = USE_KONG ? undefined : await fetchTvlUpdates();

	for(const [index, chain] of config.chains.entries()) {
		latest.push(...(vaultverse[index] || []).map(vault => {
			const current = currentVaults.find(v => v.network.chainId === chain.id && v.address === vault.address);

			const update = USE_KONG
				? {...current, ...vault} as Seafood.Vault
				: merge(current || Seafood.defaultVault, vault as yDaemon.Vault, chain) as Seafood.Vault;

			if(!USE_KONG && tvlUpdates) {
				const tvls = tvlUpdates[chain.id][vault.address] || {tvls: [], dates: []};
				if(!tvls.tvls.length) {
					tvls.tvls = [0, 0, 0];
					tvls.dates = [0, 0, 0];
				}
				update.tvls = tvls;
			}

			return update;
		}));
	}

	sort(latest);
	hydrateBigNumbersRecursively(latest);
	aggregateRiskGroupTvls(latest);
	await clearVaults();
	await putVaults(latest);
	await requestVaults();

	// fetch multicalls
	if(!USE_KONG) {
		const multicallUpdates = await fetchMulticallUpdates(vaultverse as yDaemon.Vault[][]);
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
	
		await putVaults(latest);
		await requestVaults();
	}

	// fetch rewards
	const strategyRewardsUpdates = await fetchRewardsUpdates(latest);
	for(const [index, chain] of config.chains.entries()) {
		const rewardsUpdates = strategyRewardsUpdates[index];

		latest.filter(vault => vault.network.chainId === chain.id).forEach(vault => {
			vault.withdrawalQueue.forEach(strategy => {
				const update = rewardsUpdates.find(update => update.chainId === chain.id && update.address === strategy.address);
				strategy.rewards = update?.rewards || [];
			});

			vault.rewardsUsd = vault.withdrawalQueue.map(s => s.rewards).flat()
				.reduce((acc, reward) => acc + reward?.amountUsd, 0)
				|| 0;
		});
	}

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

async function clearVaults() {
	return new Promise<void>(async (resolve, reject) => {
		const db = await openDb();
		const store = db.transaction('vaults', 'readwrite').objectStore('vaults');
		const request = store.clear();
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

async function fetchYDaemonVaults() : Promise<yDaemon.Vault[][]> {
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
				? toBigNumber(results[4].returnValues[0])
				: ethers.constants.Zero;
			parsed.push({
				type: 'vault',
				chainId: chain.id,
				address: vault.address,
				totalDebt: toBigNumber(results[0].returnValues[0]),
				debtRatio: results[1].returnValues[0] ? toBigNumber(results[1].returnValues[0]) : undefined,
				totalAssets: results[2].returnValues[0] ? toBigNumber(results[2].returnValues[0]) : undefined,
				availableDepositLimit: toBigNumber(results[3].returnValues[0]),
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
					deposits: toBigNumber(tuple[1]),
					apr: toBigNumber(tuple[2]),
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

		if(vault.depositLimit.eq(0) && vault.type === 'vault') {
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
query Query {
  vaults {
		chainId
		address
    name
		type
		totalAssets
    totalDebt
		totalIdle
    apiVersion
    symbol
    decimals
		depositLimit
    availableDepositLimit
    lockedProfitDegradation
    debtRatio
    assetAddress
    assetSymbol
    assetName
    assetPriceUsd
		assetPriceSource
    managementFee
    performanceFee
		registryStatus
		governance
		activationBlockTime
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
			tradeFactory
			activationBlockTime
      lenderStatuses {
        name
        address
        assets
        rate
      }
		}
		defaultQueue {
      address
      name
			apiVersion
      debtRatio
			currentDebt
			currentDebtRatio
      totalAssets
      performanceFee
      totalDebt
			activationBlockTime
      keeper
      latestReportBlockTime
      doHealthCheck
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

  riskGroups {
    chainId
    name
    auditScore
    codeReviewScore
    complexityScore
    protocolSafetyScore
    teamKnowledgeScore
    testingScore
  }
}
`;

const toBigNumberEx = /^\d+[n]?$/;
function toBigNumber(value: string | BigNumber | { type: string, hex: string } |  number) {
	if (typeof value === 'object' && value !== null && 'type' in value && value.type === 'BigNumber') {
		return BigNumber.from(value.hex);
	}

	if(toBigNumberEx.test(value.toString())) {
		return BigNumber.from(value.toString().replace('n', ''));
	} else {
		throw new Error(`!toBigNumberEx.test, ${value}`);
	}
}

async function fetchKongVaults(): Promise<Seafood.Vault[][]> {
	if(!process.env.REACT_APP_KONG_API_URL) throw new Error('!process.env.REACT_APP_KONG_API_URL');

	const status = {status: 'refreshing', stage: 'kong', chain: 'all', timestamp: Date.now()} as RefreshStatus;
	await putStatus(status);

	try {
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
			type: kongVault.type,
			price: kongVault.assetPriceUsd,
			priceSource: kongVault.assetPriceSource,
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
			totalAssets: toBigNumber(kongVault.totalAssets),
			totalIdle: kongVault.totalIdle ? toBigNumber(kongVault.totalIdle) : undefined,
			availableDepositLimit: kongVault.availableDepositLimit,
			lockedProfitDegradation: toBigNumber(kongVault.lockedProfitDegradation || 0),
			totalDebt: kongVault.totalDebt,
			decimals: toBigNumber(kongVault.decimals || 0),
			debtRatio: toBigNumber(kongVault.debtRatio || 0),
			managementFee: toBigNumber(kongVault.managementFee || 0),
			performanceFee: toBigNumber(kongVault.performanceFee || 0),
			depositLimit: toBigNumber(kongVault.depositLimit || 0),
			activation: toBigNumber(kongVault.activationBlockTime || 0),
			tvls: {
				dates: kongVault.tvlSparkline.map(point => point.time),
				tvls: kongVault.tvlSparkline.map(point => point.value)
			},
			apy: {
				type: 'v2:averaged',
				gross: kongVault.aprGross,
				net: kongVault.apyNet,
				[-7]: kongVault.apyWeeklyNet,
				[-30]: kongVault.apyMonthlyNet,
				inception: kongVault.apyInceptionNet
			},
			withdrawalQueue: getWithdrawalQueue(kongVault),
		} as Seafood.Vault));

		const riskGroups = json.data.riskGroups as {
			chainId: number,
			name: string,
			auditScore: number,
			codeReviewScore: number,
			complexityScore: number,
			longevityImpact: number,
			protocolSafetyScore: number,
			teamKnowledgeScore: number,
			testingScore: number
		} [];

		const strategies = flat.map((vault: Seafood.Vault) => vault.withdrawalQueue).flat();
		riskGroups.forEach(group => {
			const strategiesInGroup = strategies.filter((strategy: Seafood.Strategy) => strategy.risk.riskGroupId === kabobCase(group.name));
			const worstLongevityScoreInGroup = strategiesInGroup
				.map((strategy: Seafood.Strategy) => computeLongevityScore(strategy))
				.reduce((max: number, score: number) => score > max ? score : max, 1);
			group.longevityImpact = worstLongevityScoreInGroup;
			strategiesInGroup.forEach((strategy: Seafood.Strategy) => {
				strategy.risk.riskDetails.auditScore = group.auditScore;
				strategy.risk.riskDetails.codeReviewScore = group.codeReviewScore;
				strategy.risk.riskDetails.complexityScore = group.complexityScore;
				strategy.risk.riskDetails.longevityImpact = computeLongevityScore(strategy);
				strategy.risk.riskDetails.protocolSafetyScore = group.protocolSafetyScore;
				strategy.risk.riskDetails.teamKnowledgeScore = group.teamKnowledgeScore;
				strategy.risk.riskDetails.testingScore = group.testingScore;
				strategy.risk.riskDetails.median = medianExlcudingTvlImpact(strategy.risk.riskDetails);
			});
		});

		flat.forEach((vault: Seafood.Vault) => {
			vault.strategies = [...vault.withdrawalQueue];
		});
	
		const result = [];
		for(const chain of config.chains) {
			result.push(flat.filter((vault: Seafood.Vault) => vault.network.chainId === chain.id));
		}

		await putStatus({...status, status: 'ok', timestamp: Date.now()});
		return result;

	} catch(error) {
		await putStatus({...status, status: 'warning', error, timestamp: Date.now()});
		return [];
	}
}

function getWithdrawalQueue(kongVault: Kong.Vault) {
	if(kongVault.defaultQueue.length > 0) {
		return kongVault.defaultQueue.map((tokenizedStrategy: Omit<Kong.Vault, 'defaultQueue' | 'withdrawalQueue'>) => ({
			network: {
				chainId: kongVault.chainId,
				name: getChain(kongVault.chainId).name
			},
			address: tokenizedStrategy.address,
			name: tokenizedStrategy.name,
			apiVersion: tokenizedStrategy.apiVersion,
			description: '',
			debtRatio: toBigNumber(tokenizedStrategy.debtRatio || 0),
			currentDebt: toBigNumber(tokenizedStrategy.currentDebt || 0),
			currentDebtRatio: toBigNumber(tokenizedStrategy.currentDebtRatio || 0),
			performanceFee: toBigNumber(tokenizedStrategy.performanceFee || 0),
			estimatedTotalAssets: toBigNumber(tokenizedStrategy.totalAssets || 0),
			totalIdle: toBigNumber(tokenizedStrategy.totalIdle || 0),
			delegatedAssets: toBigNumber(0),
			lastReport: toBigNumber(tokenizedStrategy.latestReportBlockTime || 0),
			totalDebt: toBigNumber(tokenizedStrategy.totalDebt || 0),
			totalDebtUSD: 0,
			totalGain: toBigNumber(0),
			totalLoss: toBigNumber(0),
			withdrawalQueuePosition: tokenizedStrategy.queueIndex,
			doHealthCheck: tokenizedStrategy.doHealthCheck,
			keeper: tokenizedStrategy.keeper,
			activation: toBigNumber(tokenizedStrategy.activationBlockTime || 0),
			rewards: [] as Seafood.Reward[],
			risk: {
				tvl: 0,
				riskGroupId: 'no-group',
				riskGroup: 'No Group',
				riskScore: 0,
				riskDetails: {
					TVLImpact: 1,
					auditScore: 5,
					codeReviewScore: 5,
					complexityScore: 5,
					longevityImpact: 5,
					protocolSafetyScore: 5,
					teamKnowledgeScore: 5,
					testingScore: 5,
					median: 5
				},
			}
		})) as Seafood.Strategy[];
	} else {
		return kongVault.withdrawalQueue.map((kongStrategy: Kong.Strategy) => ({
			network: {
				chainId: kongVault.chainId,
				name: getChain(kongVault.chainId).name
			},
			address: kongStrategy.address,
			name: kongStrategy.name,
			apiVersion: kongVault.apiVersion,
			description: '',
			risk: {
				tvl: 0,
				riskGroupId: kongStrategy.riskGroup ? kabobCase(kongStrategy.riskGroup) : 'no-group',
				riskGroup: kongStrategy.riskGroup || 'No Group',
				riskScore: 0,
				riskDetails: {
					TVLImpact: 1,
					auditScore: 5,
					codeReviewScore: 5,
					complexityScore: 5,
					longevityImpact: 5,
					protocolSafetyScore: 5,
					teamKnowledgeScore: 5,
					testingScore: 5,
					median: 5
				},
				allocation: {
					availableAmount: '0',
					availableTVL: '0',
					currentAmount: '0',
					currentTVL: '0'
				}
			},
			debtRatio: toBigNumber(kongStrategy.debtRatio || 0),
			performanceFee: toBigNumber(kongStrategy.performanceFee || 0),
			estimatedTotalAssets: toBigNumber(kongStrategy.estimatedTotalAssets || 0),
			delegatedAssets: toBigNumber(kongStrategy.delegatedAssets || 0),
			lastReport: toBigNumber(kongStrategy.lastReportBlockTime || 0),
			totalDebt: toBigNumber(kongStrategy.totalDebt || 0),
			totalDebtUSD: kongStrategy.totalDebtUsd,
			totalGain: toBigNumber(0),
			totalLoss: toBigNumber(0),
			withdrawalQueuePosition: kongStrategy.withdrawalQueueIndex,
			lendStatuses: kongStrategy.lenderStatuses.map((status: Kong.LenderStatus) => ({
				name: status.name,
				address: status.address,
				deposits: status.assets,
				apr: status.rate
			} as Seafood.LendStatus)),
			healthCheck: kongStrategy.healthCheck,
			doHealthCheck: kongStrategy.doHealthCheck,
			tradeFactory: kongStrategy.tradeFactory,
			keeper: kongStrategy.keeper,
			activation: toBigNumber(kongStrategy.activationBlockTime || 0),
			rewards: [] as Seafood.Reward[]
		}));
	}
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

async function fetchRewardsUpdates(vaults: Seafood.Vault[])
: Promise<StrategyRewardsUpdate[][]> {
	const result = [] as StrategyRewardsUpdate[][];
	for(const chain of config.chains) {
		const status = {status: 'refreshing', stage: 'rewards', chain: chain.id, timestamp: Date.now()} as RefreshStatus;
		await putStatus(status);
		try {
			const updates = await fetchRewards(vaults.filter(v => v.network.chainId === chain.id), chain);
			result.push(updates);
			await putStatus({...status, status: 'ok', timestamp: Date.now()});
		} catch(error) {
			result.push([]);
			await putStatus({...status, status: 'warning', error, timestamp: Date.now()});
		}
	}
	return result;
}

async function fetchRewards(vaults: Seafood.Vault[], chain: Seafood.Chain) {
	const strategies = vaults.map(vault => vault.strategies).flat().filter(s => s.tradeFactory && s.tradeFactory !== ethers.constants.AddressZero);
	const multicallAddress = config.chains.find(c => c.id === chain.id)?.multicall;
	const multicall = new Multicall({ethersProvider: providerFor(chain), tryAggregate: true, multicallCustomContractAddress: multicallAddress});
	const balanceMulticalls = [];

	for(const strategy of strategies) {
		const tradeables = await getTradeables(strategy.address, strategy.tradeFactory as string, chain);
		balanceMulticalls.push(...tradeables.map(tradeable => ({
			reference: `${tradeable.token}/${strategy.address}`,
			contractAddress: tradeable.token,
			abi: abi.erc20,
			calls: [{reference: 'balanceOf', methodName: 'balanceOf', methodParameters: [strategy.address]}]
		})));
	}

	const balanceResults = await batchMulticalls(multicall, balanceMulticalls);

	const udpates = [] as StrategyRewardsUpdate[];
	for(const strategy of strategies) {
		const tradeFactory = strategy.tradeFactory;
		const tradeables = await getTradeables(strategy.address, tradeFactory as string, chain);

		const rewards = [] as Seafood.Reward[];
		for(const tradeable of tradeables) {
			const amount = toBigNumber(balanceResults[`${tradeable.token}/${strategy.address}`].callsReturnContext[0].returnValues[0]);
			let amountUsd = 0;

			if(amount.gt(0)) {
				let price = await getPrice(tradeable.token, chain);
				if(Number.isNaN(price)) {
					console.warn('price NaN', chain.id, strategy, tradeable.token, tradeable.name, tradeable.symbol);
					price = 0;
				}
				amountUsd = price * (amount.mul(10_000).div(toBigNumber(10).pow(tradeable.decimals)).toNumber() / 10_000);
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
			address: strategy.address,
			rewards
		});
	}

	return udpates;
}

export default {} as typeof Worker & { new (): Worker };
