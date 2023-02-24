import {BigNumber, Contract, ethers, providers} from 'ethers';
import {FunctionFragment} from 'ethers/lib/utils';
import {computeStrategyApr} from '../../apr';
import {Strategy, Vault} from '../useVaults/types';
import {GetStrategyContract, GetVaultContract} from '../../ethereum/EthHelpers';
import tenderly, {SimulationResult} from '../../tenderly';

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
		harvest: {
			signature: 'harvest()',
			events: [
				'event Harvested(uint256 profit, uint256 loss, uint256 debtPayment, uint256 debtOutstanding)',
				'event StrategyReported(address indexed strategy, uint256 gain, uint256 loss, uint256 debtPaid, uint256 totalGain, uint256 totalLoss, uint256 totalDebt, uint256 debtAdded, uint256 debtRatio)'
			]
		},
	}
};

export interface Block {
	contract: Contract,
	signer: string,
	functionCall: FunctionFragment,
	functionInput: unknown[],
	processResult?: (result: SimulationResult, provider: providers.JsonRpcProvider) => Promise<BlockOutput>
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

interface RawEvent {
	topics: string[],
	data: string
}

function parseEvents(eventSignatures: string[], rawEvents: RawEvent[]) {
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

export async function makeHarvestBlock(
	vault: Vault, 
	strategy: Strategy, 
	provider: providers.JsonRpcProvider
) : Promise<Block> {
	const contract = await GetStrategyContract(strategy.address, provider);
	return {
		contract,
		signer: vault.governance,
		functionCall: contract.interface.functions[functions.strategies.harvest.signature],
		functionInput: [],
		processResult: async (result: SimulationResult, provider: providers.JsonRpcProvider) => {
			if(!result.output) throw '!result.output';
			const events = parseEvents(functions.strategies.harvest.events, result.output.events as RawEvent[]);

			const report = events.find(e => e.name === 'StrategyReported');
			if(!report) throw '!report';
			const flow = {
				profit: report.args.loss.mul(-1).add(report.args.gain),
				debt: report.args.debtPaid.mul(-1).add(report.args.debtAdded)
			};

			const snapshotBlock = await makeStrategiesBlock(vault, strategy, provider);
			const snapshot = (await tenderly.simulate(snapshotBlock, provider)).output as StrategySnapshotBlockOutput | undefined;
			const apr = snapshot ? computeStrategyApr(vault, strategy, snapshot) : {gross: 0, net: 0};

			return {events, flow, apr} as HarvestBlockOutput;
		}
	};
}

export async function makeDebtRatioUpdateBlock(
	vault: Vault, 
	strategy: Strategy, 
	debtRatio: number,
	provider: providers.JsonRpcProvider
) : Promise<Block> {
	const contract = await GetVaultContract(vault.address, provider, vault.version);
	return {
		contract,
		signer: vault.governance,
		functionCall: contract.interface.functions[functions.vaults.updateDebtRatio.signature],
		functionInput: [strategy.address, debtRatio],
		processResult: async (result: SimulationResult) => {
			if(!result.output) throw '!result.output';
			const events = parseEvents(functions.vaults.updateDebtRatio.events, result.output.events as RawEvent[]);
			return {events};
		}
	};
}

export async function makeStrategiesBlock(
	vault: Vault, 
	strategy: Strategy, 
	provider: providers.JsonRpcProvider
) : Promise<Block> {
	const contract = await GetVaultContract(vault.address, provider, vault.version);
	return {
		contract,
		signer: vault.governance,
		functionCall: contract.interface.functions[functions.vaults.strategies.signature],
		functionInput: [strategy.address]
	};
}
