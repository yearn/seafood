import {BigNumber} from 'ethers';
import * as Seafood from '../types';

export interface StartOptions {
	refreshInterval: number
}

export interface Callback {
	onRefresh: () => void,
	onStatus: (status: RefreshStatus[]) => void,
	onVaults: (vaults: Seafood.Vault[]) => void,
	onRefreshed: (date: Date) => void
}

export interface RefreshStatus {
	status: 'refreshing' | 'ok' | 'warning'
	stage: 'ydaemon' | 'multicall' | 'tvls' | 'rewards',
	chain: number | 'all',
	error?: unknown,
	timestamp: number
}

export interface Tradeable {
	strategy: string,
	token: string,
	name: string,
	symbol: string,
	decimals: number
}

export interface VaultMulticallUpdate {
	readonly type: 'vault',
	chainId: number,
	address: string,
	totalDebt: BigNumber,
	debtRatio: BigNumber | undefined,
	totalAssets: BigNumber | undefined,
	availableDepositLimit: BigNumber,
	lockedProfitDegradation: BigNumber
}

export interface StrategyMulticallUpdate {
	readonly type: 'strategy',
	chainId: number,
	address: string,
	name: string,
	lendStatuses: Seafood.LendStatus[] | undefined,
	tradeFactory: string | undefined
}

export interface StrategyRewardsUpdate {
	readonly type: 'rewards',
	chainId: number,
	address: string,
	rewards: Seafood.Reward[]
}

export interface TVLUpdates {
	[chainId: number]: {
		[vaultAddress: string] : Seafood.TVLHistory
	}
}
