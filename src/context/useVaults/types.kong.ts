import {BigNumber} from 'ethers';

export type Vault = {
  chainId: number;
  address: string;
  name: string;
  totalAssets: BigNumber;
  totalDebt: BigNumber;
  apiVersion: string;
  symbol: string;
  decimals: number;
  availableDepositLimit: BigNumber;
  lockedProfitDegradation: number;
  debtRatio: number;
  assetAddress: string;
  assetSymbol: string;
  assetName: string;
  priceUsd: number;
  managementFee: number;
  performanceFee: number;
  registryStatus: string;
  governance: string;
  activationBlockTime: BigNumber;
  withdrawalQueue: Strategy[];
  tvlUsd: number;
  tvlSparkline: SparklinePoint[];
  apyNet: number;
  apyWeeklyNet: number;
  apyMonthlyNet: number;
  apyInceptionNet: number;
  aprGross: number;
  apySparkline: SparklinePoint[];
}

export type Strategy = {
  address: string;
  healthCheck: string;
  debtRatio: number;
  delegatedAssets: BigNumber;
  doHealthCheck: boolean;
  estimatedTotalAssets: BigNumber;
  grossApr: number;
  keeper: string;
  lastReportBlockTime: number;
  netApr: number;
  name: string;
  performanceFee: number;
  riskGroup: string;
  totalDebt: BigNumber;
  totalDebtUsd: number;
  withdrawalQueueIndex: number;
  activationBlockTime: BigNumber;
  tradeFactory: string;
}

export type SparklinePoint = {
  time: number;
  value: number;
}
