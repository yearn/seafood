import {BigNumber, Contract} from 'ethers';

export interface Strategy {
	address: string,
	debtRatio: BigNumber | undefined,
	performanceFee: BigNumber
}

export interface Vault {
	address: string,
	activation: BigNumber
	performanceFee: BigNumber,
	managementFee: BigNumber,
	apiVersion: string,
	strategies: Strategy[]
}

export interface BlockSample {
	[0]: number,
	[-7]: number,
	[-30]: number,
	inception: number
}

export interface PpsSample {
	block: number,
	pps: BigNumber
}

export interface Apy {
	gross: number,
	net: number,
	[-7]: number,
	[-30]: number,
	inception: number,
	pps: BigNumber
}

export interface ApyComputer {
  type: string,
  compute: (vault: Vault, vaultRpc: Contract, samples: BlockSample) => Promise<Apy>
}