import {BigNumber, providers} from 'ethers';
import {useMemo} from 'react';
import {useVaults} from '../../useVaults';
import {Probe} from './useProbes';
import {functions, makeStrategiesBlock, parseEvents, RawEvent, StrategySnapshotBlockOutput} from '../Blocks';
import tenderly, {SimulationResult} from '../../../tenderly';
import {computeHarvestApr} from '../../../apr';
import {useSimulatorStatus} from '../SimulatorStatusProvider';

export interface HarvestOutput {
	strategy: string,
	flow: {
		profit: BigNumber,
		debt: BigNumber
	},
	apr: {
		gross: number,
		net: number
	}
}

export default function useHarvestProbe() {
	const {vaults} = useVaults();
	const {setStatus} = useSimulatorStatus();

	const probe = useMemo(() => {
		return {
			name: 'harvest',

			stop: async (_results: SimulationResult[], provider: providers.JsonRpcProvider) => {
				const harvestResults = _results.filter(result => 
					result.block.call.signature === functions.strategies.harvest.signature
				);

				setStatus('Compute harvest outputs');
				const results = [] as HarvestOutput[];
				for(const result of harvestResults) {
					if(!result.output) continue;
					const events = parseEvents(functions.strategies.harvest.events, result.output.events as RawEvent[]);

					const report = events.find(e => e.name === 'StrategyReported');
					if(!report) throw '!report';

					const flow = {
						profit: report.args.loss.mul(-1).add(report.args.gain),
						debt: report.args.debtPaid.mul(-1).add(report.args.debtAdded)
					};

					const vault = vaults.find(v => v.withdrawalQueue.some(s => s.address === result.block.contract));
					if(!vault) throw '!vault';

					const strategy = vault.withdrawalQueue.find(s => s.address === result.block.contract);
					if(!strategy) throw '!address';

					const snapshotBlock = await makeStrategiesBlock(vault, strategy);
					const snapshotResult = await tenderly.simulate(snapshotBlock, provider);
					const snapshot = snapshotResult.output as StrategySnapshotBlockOutput | undefined;
					const apr = snapshot ? computeHarvestApr(vault, strategy, snapshot) : {gross: 0, net: 0};

					results.push({strategy: strategy.address, flow, apr});
				}

				return {name: 'harvest', output: results};
			}
		} as Probe;
	}, [vaults, setStatus]);

	return probe;
}
