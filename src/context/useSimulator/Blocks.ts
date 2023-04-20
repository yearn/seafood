import {BigNumber, ethers} from 'ethers';
import {Strategy, Vault} from '../useVaults/types';

export const functions = {
	vaults: {
		updateDebtRatio: {
			signature: 'updateStrategyDebtRatio(address,uint256)',
			events: [
				'event StrategyUpdateDebtRatio(address indexed strategy, uint256 debtRatio)'
			]
		},
		strategies: {
			signature: 'strategies(address)'
		}
	}, 
	strategies: {
		setDoHealthCheck: {
			signature: 'setDoHealthCheck(bool)'
		},
		harvest: {
			signature: 'harvest()',
			events: [
				'event Harvested(uint256 profit, uint256 loss, uint256 debtPayment, uint256 debtOutstanding)',
				'event StrategyReported(address indexed strategy, uint256 gain, uint256 loss, uint256 debtPaid, uint256 totalGain, uint256 totalLoss, uint256 totalDebt, uint256 debtAdded, uint256 debtRatio)'
			]
		}
	}
};

export interface Block {
	primitive: 'vault' | 'strategy',
	chain: number,
	contract: string,
	signer: string,
	call: {
		signature: string,
		input: unknown[]
	},
	meta?: {
		[key: string]: string | number | null | undefined
	}
}

export interface BlockOutput {
	events: unknown[]
}

export interface StrategySnapshotBlockOutput extends BlockOutput {
	totalGain: BigNumber,
	totalLoss: BigNumber
}

export interface HarvestBlockOutput extends BlockOutput {
	flow: {
		profit: BigNumber,
		debt: BigNumber
	},
	apr: {
		gross: number,
		net: number
	}
}

export interface RawEvent {
	topics: string[],
	data: string
}

export function parseEvents(eventSignatures: string[], rawEvents: RawEvent[]) {
	const result = [];
	const filter = new ethers.utils.Interface(eventSignatures);
	for(const event of rawEvents) {
		try {
			const log = filter.parseLog({topics: event.topics, data: event.data});
			result.push({...event, ...log});
		} catch(sometimesitsoktofail) {
			//shh
		}		
	}
	return result;
}

export function refsAddress(block: Block, address: string) {
	return block.contract === address
	|| block.call.input.includes(address);
}

export async function makeSetDoHealthCheckBlock(
	vault: Vault, 
	strategy: Strategy,
	doHealthCheck: boolean
) : Promise<Block> {
	return {
		primitive: 'strategy',
		chain: vault.network.chainId,
		contract: strategy.address,
		signer: vault.governance,
		call: {
			signature: functions.strategies.setDoHealthCheck.signature,
			input: [doHealthCheck]
		},
		meta: {
			status: `set doHealthCheck = ${doHealthCheck}, ${strategy.name}`
		}
	};
}

export async function makeHarvestBlock(
	vault: Vault, 
	strategy: Strategy
) : Promise<Block> {
	return {
		primitive: 'strategy',
		chain: vault.network.chainId,
		contract: strategy.address,
		signer: vault.governance,
		call: {
			signature: functions.strategies.harvest.signature,
			input: []
		},
		meta: {
			status: `Harvest ${strategy.name}`
		}
	};
}

export async function makeDebtRatioUpdateBlock(
	vault: Vault, 
	strategy: Strategy, 
	debtRatio: number,
) : Promise<Block> {
	const delta = debtRatio - (strategy.debtRatio?.toNumber() || 0);
	return {
		primitive: 'vault',
		chain: vault.network.chainId,
		contract: vault.address,
		signer: vault.governance,
		call: {
			signature: functions.vaults.updateDebtRatio.signature,
			input: [strategy.address, debtRatio]
		},
		meta: {
			delta,
			status: `Update DR ${delta > 0 ? '+' : ''}${delta}bps ${strategy.name}`
		}
	};
}

export async function makeStrategiesBlock(
	vault: Vault, 
	strategy: Strategy
) : Promise<Block> {
	return {
		primitive: 'vault',
		chain: vault.network.chainId,
		contract: vault.address,
		signer: vault.governance,
		call: {
			signature: functions.vaults.strategies.signature,
			input: [strategy.address]
		}
	};
}
