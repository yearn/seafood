import {BigNumber} from 'ethers';

export type RiskScore = {
	label: string;
	auditScore: number;
	codeReviewScore: number;
	complexityScore: number;
	protocolSafetyScore: number;
	teamKnowledgeScore: number;
	testingScore: number;
}

export type Debt = {
	strategy: '0x{$string}';
	debtRatio: BigNumber;
	totalDebt: BigNumber;
	totalDebtUsd: number;
	currentDebt: BigNumber;
	currentDebtUsd: number;
	targetDebtRatio: number;
}

export type SparklinePoint = {
	blockTime: BigNumber;
	close: number;
}

export type Vault = {
	chainId: number;
	address: `0x${string}`;
	apiVersion: string;
	name: string;
	vaultType: number;
	asset: {
		address: `0x${string}`;
		symbol: string;
		name: string;
		decimals: number;
	}
	governance: `0x${string}`;
	totalIdle: BigNumber;
	totalAssets: BigNumber;
	availableDepositLimit: BigNumber;
	lockedProfitDegradation: BigNumber;
	totalDebt: BigNumber;
	decimals: BigNumber;
	debtRatio: BigNumber;
	managementFee: BigNumber;
	performanceFee: BigNumber;
	depositLimit: BigNumber;
	deposit_limit: BigNumber;
	strategies: `0x${string}`[];
	withdrawalQueue?: `0x${string}`[];
	get_default_queue?: `0x${string}`[];
	debts: Debt[];
	inceptTime: BigNumber;
	inceptBlock: BigNumber;
	yearn?: boolean;
	sparklines: {
		[key: string]: SparklinePoint[];
	};
	apy: {
		net: number;
		weeklyNet: number;
		monthlyNet: number;
		inceptionNet: number;
		grossApr: number;
	};
	risk: RiskScore;
	meta: {
		description: string;
		token: {
			displayName: string;
			displaySymbol: string;
			description: string;
			icon: string;
		}
	};
	lastReportDetail: {
		blockTime: BigNumber;
		transactionHash: string;
	};
}

export type Strategy = {
	type: 'strategy' | 'vault',
	chainId: number;
	address: `0x${string}`;
	name: string;
	apiVersion: string;
	performanceFee: BigNumber;
	estimatedTotalAssets: BigNumber;
	totalAssets: BigNumber;
	delegatedAssets: BigNumber;
	keeper: `0x${string}`;
	lastReport: BigNumber;
	doHealthCheck: boolean;
	healthCheck: `0x${string}`;
	tradeFactory: `0x${string}`;
	claims: {
		address: `0x${string}`;
		name: string;
		symbol: string;
		decimals: number;
		balance: BigNumber;
		balanceUsd: number;
	}[];
	lenderStatuses: {
		name: string;
		address: `0x${string}`;
		assets: BigNumber;
		rate: BigNumber;
	}[];
	risk: RiskScore;
	meta: {
		description: string;
	};
}

export function toStrategy(vault: Vault | undefined | null): Strategy | undefined {
	if (!vault) return undefined;
	return {
		type: 'vault',
		chainId: vault.chainId,
		address: vault.address,
		name: vault.name,
		apiVersion: vault.apiVersion,
		performanceFee: vault.performanceFee,
		estimatedTotalAssets: vault.totalAssets,
		totalAssets: vault.totalAssets,
		delegatedAssets: vault.totalAssets,
		keeper: vault.governance,
		lastReport: vault.inceptBlock,
		doHealthCheck: false,
		healthCheck: '0x0000000000000000000000000000000000000000',
		tradeFactory: '0x0000000000000000000000000000000000000000',
		claims: [],
		lenderStatuses: [],
		risk: {
			label: vault.name,
			auditScore: 0,
			codeReviewScore: 0,
			complexityScore: 0,
			protocolSafetyScore: 0,
			teamKnowledgeScore: 0,
			testingScore: 0,
		},
		meta: {
			description: vault.meta?.description
		}
	};
}
