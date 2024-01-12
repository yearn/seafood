import {BigNumber} from 'ethers';

export type Vault = {
  chainId: number;
  address: string;
  name: string;
  type: string;
  totalAssets: BigNumber;
  totalDebt: BigNumber;
  totalIdle: BigNumber;
  apiVersion: string;
  symbol: string;
  decimals: number;
  depositLimit: BigNumber;
  availableDepositLimit: BigNumber;
  lockedProfitDegradation: number;
  debtRatio: number;
  currentDebt: BigNumber;
  currentDebtRatio: number;
  assetAddress: string;
  assetSymbol: string;
  assetName: string;
  assetPriceUsd: number;
  assetPriceSource: string;
  managementFee: number;
  performanceFee: number;
  registryStatus: string;
  governance: string;
  activationBlockTime: BigNumber;
  latestReportBlockTime: BigNumber;
  keeper: string;
  doHealthCheck: boolean;
  withdrawalQueue: Strategy[];
  defaultQueue: Omit<Vault, 'defaultQueue' | 'withdrawalQueue'>[];
  queueIndex: number;
  tvlUsd: number;
  tvlSparkline: SparklinePoint[];
  apyNet: number;
  apyWeeklyNet: number;
  apyMonthlyNet: number;
  apyInceptionNet: number;
  aprGross: number;
  apySparkline: SparklinePoint[];
}

export type LenderStatus = {
  chainId: number;
  address: string;
  name: string;
  assets: BigNumber;
  rate: BigNumber;
}

export type Strategy = {
  address: string;
  healthCheck: string;
  debtRatio: number;
  delegatedAssets: BigNumber;
  lenderStatuses: LenderStatus[];
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
