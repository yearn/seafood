import {BigNumber} from 'ethers';
import * as yDaemon from './types.ydaemon';

export interface Chain {
	id: number,
	name: string,
	providers: string[]
}

export interface Vault {
	address: string,
	name: string,
	network: {
		chainId: number,
		name: string
	},
	version: string,
	want: string,
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
	apy: {
		type: string,
		gross: number,
		net: number,
		[-7]: number,
		[-30]: number,
		inception: number
	},
	tvls: ITVLHistory
}

export interface ITVLHistory {
	dates: number[],
	tvls: number[]
}

export interface Strategy {
	address: string,
	name: string,
	network: {
		chainId: number,
		name: string
	},
	activation: BigNumber,
	debtRatio: BigNumber | undefined,
	performanceFee: BigNumber,
	estimatedTotalAssets: BigNumber,
	delegatedAssets: BigNumber,
	lastReport: BigNumber,
	totalDebt: BigNumber,
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

export function parseVault(vault: yDaemon.Vault, chain: Chain, tvls: ITVLHistory) : Vault {
	return {
		address: vault.address,
		name: vault.name,
		network: {
			chainId: chain.id,
			name: chain.name
		},
		version: vault.version,
		want: vault.token.address,
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
			.map(strategy => parseStrategy(strategy, chain)),
		withdrawalQueue: vault.strategies
			.filter(s => s.details.withdrawalQueuePosition > -1)
			.sort((a, b) => a.details.withdrawalQueuePosition - b.details.withdrawalQueuePosition)
			.map(strategy => parseStrategy(strategy, chain)),
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

export function parseStrategy(strategy: yDaemon.Strategy, chain: Chain) : Strategy {
	return {
		address: strategy.address,
		name: strategy.name,
		network: {
			chainId: chain.id,
			name: chain.name
		},
		delegatedAssets: BigNumber.from(strategy.details.delegatedAssets || 0),
		estimatedTotalAssets: BigNumber.from(strategy.details.estimatedTotalAssets || 0),
		performanceFee: strategy.details.performanceFee,
		activation: strategy.details.activation,
		debtRatio: strategy.details.debtRatio
			? BigNumber.from(strategy.details.debtRatio)
			: undefined,
		lastReport: strategy.details.lastReport,
		totalDebt: BigNumber.from(strategy.details.totalDebt || 0),
		totalGain: BigNumber.from(strategy.details.totalGain || 0),
		totalLoss: BigNumber.from(strategy.details.totalLoss || 0),
		withdrawalQueuePosition: strategy.details.withdrawalQueuePosition,
		lendStatuses: undefined
	};
}
