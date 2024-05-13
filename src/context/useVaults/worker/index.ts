import {BigNumber, ethers} from 'ethers';
import {aggregateRiskGroupTvls, computeLongevityScore, medianExlcudingTvlImpact} from '../risk';
import config from '../../../config.json';
import * as Kong from '../types.kong';
import * as Kong2 from '../types.kong.2';
import * as Seafood from '../types';
import {getChain, hydrateBigNumbersRecursively, kabobCase} from '../../../utils/utils';
import {Callback, StartOptions, RefreshStatus, Tradeable} from './types';


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

	const vaultverse = await fetchKongVaults();

	for(const [index, chain] of config.chains.entries()) {
		latest.push(...(vaultverse[index] || []).map(vault => {
			const current = currentVaults.find(v => v.network.chainId === chain.id && v.address === vault.address);
			const update = {...current, ...vault} as Seafood.Vault;
			return update;
		}));
	}

	sort(latest);
	hydrateBigNumbersRecursively(latest);
	aggregateRiskGroupTvls(latest);
	await clearVaults();
	await putVaults(latest);
	await requestVaults();

	// eslint-disable-next-line
	for(const [index, chain] of config.chains.entries()) {
		latest.filter(vault => vault.network.chainId === chain.id).forEach(vault => {
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

const KONG_QUERY_2 = `
query Query {
  vaults {
    chainId
    address
		apiVersion
    name
		asset {
      address,
      symbol,
      name,
			decimals
    }
		governance
		totalIdle
		totalAssets
		availableDepositLimit
		lockedProfitDegradation
		totalDebt
		decimals
		debtRatio
		managementFee
		performanceFee
		depositLimit
		deposit_limit
		withdrawalQueue
		get_default_queue
		inceptTime
		inceptBlock
		debts {
			strategy
			debtRatio
			totalDebt
			totalDebtUsd
			totalGain
			currentDebt
			currentDebtUsd
			targetDebtRatio
		}
    sparklines {
      tvl {
        blockTime
        close
      }
      apy {
        blockTime
        close
      }
    }
		apy {
			net
			weeklyNet
			monthlyNet
			inceptionNet
			grossApr
		}
  }

	strategies {
		chainId
		address
		name
		apiVersion
		performanceFee
		estimatedTotalAssets
		totalAssets
		delegatedAssets
		keeper
		lastReport
		doHealthCheck
		tradeFactory
    claims {
      address
			name
			symbol
			decimals
      balance
      balanceUsd
    }
		lenderStatuses {
			name
			address
			assets
			rate
		}
		risk {
			label
      auditScore
      codeReviewScore
      complexityScore
      protocolSafetyScore
      teamKnowledgeScore
      testingScore
		}
	}
}
`;

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
function toBigNumber(value: string | BigNumber | { type: string, hex: string } | number | undefined | null) {
	if (value === undefined || value === null) return BigNumber.from(0);

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
	if(!process.env.REACT_APP_KONG_2_API_URL) throw new Error('!process.env.REACT_APP_KONG_2_API_URL');
	const status = {status: 'refreshing', stage: 'kong', chain: 'all', timestamp: Date.now()} as RefreshStatus;
	await putStatus(status);

	try {
		const response = await fetch(process.env.REACT_APP_KONG_API_URL, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({query: KONG_QUERY})
		});

		const response2 = await fetch(process.env.REACT_APP_KONG_2_API_URL, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({query: KONG_QUERY_2})
		});

		if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

		const json = await response.json();
		if (json.error) throw new Error(json.error);

		const json2 = await response2.json();
		if (json2.error) throw new Error(json2.error);

		let flat: Seafood.Vault[] = json2.data.vaults.map((vault2: Kong2.Vault) => {
			return {
				address: vault2.address,
				name: vault2.name,
				network: {
					chainId: vault2.chainId,
					name: getChain(vault2.chainId).name
				},
				version: vault2.apiVersion,
				want: vault2.asset.address,
				type: 'vault',
				token: {
					address: vault2.asset.address,
					name: vault2.asset.name,
					symbol: vault2.asset.symbol,
					decimals: vault2.asset.decimals
				},
				governance: vault2.governance,
				totalIdle: toBigNumber(vault2.totalIdle),
				totalAssets: toBigNumber(vault2.totalAssets),
				availableDepositLimit: toBigNumber(vault2.availableDepositLimit),
				lockedProfitDegradation: toBigNumber(vault2.lockedProfitDegradation),
				totalDebt: toBigNumber(vault2.totalDebt),
				decimals: toBigNumber(vault2.decimals),
				debtRatio: toBigNumber(vault2.debtRatio),
				managementFee: toBigNumber(vault2.managementFee),
				performanceFee: toBigNumber(vault2.performanceFee),
				depositLimit: toBigNumber(vault2.depositLimit || vault2.deposit_limit),
				activation: toBigNumber(vault2.inceptTime || 0),
				tvls: {
					dates: vault2.sparklines['tvl'].map(point => Number(point.blockTime)).reverse(),
					tvls: vault2.sparklines['tvl'].map(point => Number(point.close)).reverse()
				},
				apy: {
					type: 'v2:averaged',
					gross: vault2.apy?.grossApr,
					net: vault2.apy?.net,
					[-7]: vault2.apy?.weeklyNet,
					[-30]: vault2.apy?.monthlyNet,
					inception: vault2.apy?.inceptionNet
				},
				withdrawalQueue: getWithdrawalQueue(vault2, json2.data.vaults, json2.data.strategies),
			} as Seafood.Vault;
		});

		flat = flat.filter(vault => vault !== null) as Seafood.Vault[];

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
			const vaults = flat.filter((vault: Seafood.Vault) => vault.network.chainId === chain.id);
			result.push(vaults);
		}

		await putStatus({...status, status: 'ok', timestamp: Date.now()});
		return result;

	} catch(error) {
		await putStatus({...status, status: 'warning', error, timestamp: Date.now()});
		return [];
	}
}

function getWithdrawalQueue(vault2: Kong2.Vault, vaults: Kong2.Vault[], strategies: Kong2.Strategy[]) {
	const addresses: `0x${string}`[] = vault2.withdrawalQueue || vault2.get_default_queue || [];
	const result = addresses.map((address: `0x${string}`, index: number) => {
		let strategy = strategies.find((s: Kong2.Strategy) => s.address === address);
		if (!strategy) strategy = Kong2.toStrategy(vaults.find((v: Kong2.Vault) => v.address === address));
		if (!strategy) return null;
		const debt = vault2.debts.find((debt: Kong2.Debt) => debt.strategy === address);

		const currentDebtRatio = toBigNumber(vault2.totalDebt ?? 0).gt(0)
			? (toBigNumber(debt?.currentDebt ?? debt?.totalDebt ?? 0).mul(10_000)).div(toBigNumber(vault2.totalDebt))
			: 0;

		return {
			network: {
				chainId: vault2.chainId,
				name: getChain(vault2.chainId).name
			},
			address,
			name: strategy.name,
			apiVersion: strategy.apiVersion,
			description: '',
			debtRatio: toBigNumber(debt?.debtRatio ?? debt?.targetDebtRatio),
			currentDebt: toBigNumber(debt?.currentDebt ?? debt?.totalDebt),
			currentDebtRatio,
			performanceFee: toBigNumber(strategy.performanceFee),
			estimatedTotalAssets: toBigNumber(strategy.estimatedTotalAssets ?? strategy.totalAssets),
			totalIdle: toBigNumber(0),
			delegatedAssets: toBigNumber(strategy.delegatedAssets),
			lastReport: toBigNumber(strategy.lastReport),
			totalDebt: toBigNumber(debt?.totalDebt ?? 0),
			totalDebtUSD: debt?.totalDebtUsd || 0,
			totalGain: toBigNumber(0),
			totalLoss: toBigNumber(0),
			withdrawalQueuePosition: index,
			doHealthCheck: strategy.doHealthCheck,
			keeper: strategy.keeper,
			activation: toBigNumber(0),
			tradeFactory: strategy.tradeFactory,
			rewards: strategy.claims?.map(c => ({
				token: c.address,
				name: c.name,
				symbol: c.symbol,
				decimals: c.decimals,
				amount: toBigNumber(c.balance),
				amountUsd: c.balanceUsd
			})) as Seafood.Reward[],
			lendStatuses: strategy.lenderStatuses?.map(s => ({
				name: s.name,
				address: s.address,
				deposits: s.assets,
				apr: s.rate
			})) as Seafood.LendStatus[],
			risk: {
				tvl: 0,
				riskGroupId: strategy.risk?.label ?? 'no-group',
				riskGroup: strategy.risk?.label ?? 'No Group',
				riskScore: 0,
				riskDetails: {
					TVLImpact: 1,
					auditScore: strategy.risk?.auditScore ?? 5,
					codeReviewScore: strategy.risk?.codeReviewScore ?? 5,
					complexityScore: strategy.risk?.complexityScore ?? 5,
					longevityImpact: 5,
					protocolSafetyScore: strategy.risk?.protocolSafetyScore ?? 5,
					teamKnowledgeScore: strategy.risk?.teamKnowledgeScore ?? 5,
					testingScore: strategy.risk?.testingScore ?? 5,
					median: 5
				}
			}
		} as Seafood.Strategy;
	});

	return result.filter((s: Seafood.Strategy | null) => s !== null) as Seafood.Strategy[];
}

export default {} as typeof Worker & { new (): Worker };
