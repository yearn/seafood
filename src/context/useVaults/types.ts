import {BigNumber} from 'ethers';

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
	decimals: number,
	description: string
}

export interface Apy {
	type: string,
	gross: number,
	net: number,
	[-7]: number,
	[-30]: number,
	inception: number
}

export interface Warning {
	key: 'noHealthCheck' | 'noDepositLimit',
	message: string
}

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
	tvls: TVLHistory,
	rewardsUsd: number,
	warnings: Warning[]
}

export interface TVLHistory {
	dates: number[],
	tvls: number[]
}

export const defaultVault = {
	...({} as Vault),
	network: {} as Network,
	token: {} as Token,
	apy: {} as Apy,
	strategies: [],
	withdrawalQueue: [],
	warnings: [],
	tvls: {
		dates: [],
		tvls: []
	} as TVLHistory
};

export interface Strategy {
	address: string,
	name: string,
	description: string,
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
	lendStatuses: LendStatus[] | undefined,
	healthCheck: string,
	doHealthCheck: boolean,
	tradeFactory: string | undefined,
	keeper: string | undefined,
	rewards: Reward[],
}

export interface LendStatus {
	name: string,
	address: string,
	deposits: BigNumber,
	apr: BigNumber
}

export interface Reward {
	token: string,
	name: string,
	symbol: string,
	decimals: number,
	amount: BigNumber,
	amountUsd: number,
}

export const defaultStrategy = {
	...({} as Strategy),
	risk: {} as RiskReport,
	network: {} as Network,
	lendStatuses: [],
	rewards: []
};

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
