import {BigNumber} from 'ethers';

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
	withdrawalQueue?: `0x${string}`[];
	get_default_queue?: `0x${string}`[];
	debts: Debt[];
	inceptTime: BigNumber;
	inceptBlock: BigNumber;
	sparklines: {
		[key: string]: SparklinePoint[];
	};
	apy: {
		net: number;
		weeklyNet: number;
		monthlyNet: number;
		inceptionNet: number;
		grossApr: number;
	}
}

export type Strategy = {
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
	risk: {
		label: string;
		auditScore: number;
		codeReviewScore: number;
		complexityScore: number;
		protocolSafetyScore: number;
		teamKnowledgeScore: number;
		testingScore: number;
	}
}

export function toStrategy(vault: Vault | undefined | null): Strategy | undefined {
	if (!vault) return undefined;
	return {
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
		}
	};
}
