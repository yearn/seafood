import {BigNumber} from 'ethers';
import {medianExlcudingTvlImpact, riskGroupNameToId} from './risk';
import * as yDaemon from './types.ydaemon';

export interface Chain {
	id: number,
	name: string,
	providers: string[]
}

export interface Network {
	chainId: number,
	name: string
}

export interface Token {
	address: string,
	name: string,
	symbol: string,
	decimals: number
}

export interface Apy {
	type: string,
	gross: number,
	net: number,
	[-7]: number,
	[-30]: number,
	inception: number
}

export const defaultVault = {
	...({} as Vault),
	network: {} as Network,
	token: {} as Token,
	apy: {} as Apy,
	tvls: {
		dates: [],
		tvls: []
	} as TVLHistory
};

export interface Vault {
	address: string,
	name: string,
	price: number,
	network: Network,
	version: string,
	want: string,
	token: Token,
	governance: string,
	totalAssets: BigNumber | undefined,
	availableDepositLimit: BigNumber | undefined,
	lockedProfitDegradation: BigNumber | undefined,
	totalDebt: BigNumber | undefined,
	decimals: BigNumber,
	debtRatio: BigNumber | undefined,
	managementFee: BigNumber,
	performanceFee: BigNumber,
	depositLimit: BigNumber,
	activation: BigNumber,
	strategies: Strategy[],
	withdrawalQueue: Strategy[],
	apy: Apy,
	tvls: TVLHistory
}

export interface TVLHistory {
	dates: number[],
	tvls: number[]
}

export interface Strategy {
	address: string,
	name: string,
	risk: RiskReport,
	network: Network,
	activation: BigNumber,
	debtRatio: BigNumber | undefined,
	performanceFee: BigNumber,
	estimatedTotalAssets: BigNumber,
	delegatedAssets: BigNumber,
	lastReport: BigNumber,
	totalDebt: BigNumber,
	totalDebtUSD: number,
	totalGain: BigNumber,
	totalLoss: BigNumber,
	withdrawalQueuePosition: number,
	lendStatuses: LendStatus[] | undefined
}

export interface LendStatus {
	name: string,
	address: string,
	deposits: BigNumber,
	apr: BigNumber
}

export interface RiskCategories {
	TVLImpact: number,
	auditScore: number,
	codeReviewScore: number,
	complexityScore: number,
	longevityImpact: number,
	protocolSafetyScore: number,
	teamKnowledgeScore: number,
	testingScore: number,
	median: number
}

export function defaultRiskCategories() : RiskCategories {
	return {
		TVLImpact: 0, auditScore: 0, codeReviewScore: 0, 
		complexityScore: 0, longevityImpact: 0, protocolSafetyScore: 0,
		teamKnowledgeScore: 0, testingScore: 0, median: 0
	};
}

export interface RiskReport {
	riskGroupId: string,
	riskGroup: string,
	riskScore: number,
	allocation: {
		availableAmount: string,
		availableTVL: string,
		currentAmount: string,
		currentTVL: string,
	},
	riskDetails: RiskCategories,
	tvl: number
}

export function parseVault(vault: yDaemon.Vault, chain: Chain, tvls: TVLHistory) : Vault {
	return {
		address: vault.address,
		name: vault.name,
		price: vault.tvl.price,
		network: {
			chainId: chain.id,
			name: chain.name
		},
		version: vault.version,
		want: vault.token.address,
		token: {...vault.token},
		governance: vault.details.governance,
		totalAssets: undefined,
		availableDepositLimit: undefined,
		lockedProfitDegradation: undefined,
		totalDebt: undefined,
		decimals: vault.decimals,
		debtRatio: undefined,
		managementFee: BigNumber.from(vault.details.managementFee),
		performanceFee: BigNumber.from(vault.details.performanceFee),
		depositLimit: BigNumber.from(vault.details.depositLimit),
		activation: BigNumber.from(vault.inception),
		strategies: vault.strategies
			.map(strategy => parseStrategy(vault, strategy, chain)),
		withdrawalQueue: vault.strategies
			.filter(s => s.details.withdrawalQueuePosition > -1)
			.sort((a, b) => a.details.withdrawalQueuePosition - b.details.withdrawalQueuePosition)
			.map(strategy => parseStrategy(vault, strategy, chain)),
		apy: {
			type: vault.apy.type,
			gross: vault.apy.gross_apr,
			net: vault.apy.net_apy,
			[-7]: vault.apy.points.week_ago,
			[-30]: vault.apy.points.month_ago,
			inception: vault.apy.points.inception
		},
		tvls
	};
}

export function parseStrategy(vault: yDaemon.Vault, strategy: yDaemon.Strategy, chain: Chain) : Strategy {
	return {
		address: strategy.address,
		name: strategy.name,
		risk: {
			...strategy.risk, 
			riskGroupId: riskGroupNameToId(strategy.risk.riskGroup),
			tvl: 0,
			riskDetails: {
				...strategy.risk.riskDetails,
				median: medianExlcudingTvlImpact({...strategy.risk.riskDetails, median: 0})
			}
		},
		network: {
			chainId: chain.id,
			name: chain.name
		},
		delegatedAssets: BigNumber.from(strategy.details.delegatedAssets || 0),
		estimatedTotalAssets: BigNumber.from(strategy.details.estimatedTotalAssets || 0),
		performanceFee: strategy.details.performanceFee,
		activation: strategy.details.activation,
		debtRatio: BigNumber.from(strategy.details.debtRatio || 0),
		lastReport: strategy.details.lastReport,
		totalDebt: BigNumber.from(strategy.details.totalDebt || 0),
		totalDebtUSD: totalDebtUSD(vault, strategy),
		totalGain: BigNumber.from(strategy.details.totalGain || 0),
		totalLoss: BigNumber.from(strategy.details.totalLoss || 0),
		withdrawalQueuePosition: strategy.details.withdrawalQueuePosition,
		lendStatuses: undefined
	};
}

function totalDebtUSD(vault: yDaemon.Vault, strategy: yDaemon.Strategy) {
	if(!strategy.details.totalDebt) return 0;
	const debt = BigNumber.from(strategy.details.totalDebt || 0);
	return vault.tvl.price * debt.div(BigNumber.from('10').pow(vault.decimals)).toNumber();
}
