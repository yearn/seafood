import {BigNumber} from 'ethers';

export interface Strategy {
  address: string,
  name: string,
  details: {
    activation: BigNumber,
    debtRatio: BigNumber | undefined,
    performanceFee: BigNumber,
    estimatedTotalAssets: BigNumber,
    delegatedAssets: BigNumber,
    lastReport: BigNumber,
    totalDebt: BigNumber,
    totalGain: BigNumber,
    totalLoss: BigNumber,
    withdrawalQueuePosition: number    
  }
}

export interface Vault {
	address: string,
  name: string,
  version: string,
  token: {address: string},
  decimals: BigNumber,
  inception: BigNumber,
  details: {
    governance: string,
    managementFee: BigNumber,
    performanceFee: BigNumber,
    depositLimit: BigNumber,
  },
  apy: {
    type: string,
    gross_apr: number,
    net_apy: number,
    points: {
      week_ago: number,
      month_ago: number,
      inception: number
    }
  }
	strategies: Strategy[]
}
