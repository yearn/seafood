import {BigNumber} from 'ethers';

export type Debt = {
  strategy: `0x{$string}`;
  debtRatio: BigNumber;
  totalDebt: BigNumber;
  totalDebtUsd: number;
  currentDebt: BigNumber;
  currentDebtUsd: number;
  targetDebtRatio: number;
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
