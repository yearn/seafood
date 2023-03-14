import {BigNumber, Contract} from 'ethers';
import {Vault} from '../context/useVaults/types';

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
