import {BigNumber, providers} from 'ethers';
import {useMemo} from 'react';
import {Probe} from './useProbes';
import {functions, parseEvents, RawEvent} from '../Blocks';
import {SimulationResult} from '../../../tenderly';
import {computeHarvestApr} from '../../../math/apr';
import {useSimulatorStatus} from '../SimulatorStatusProvider';
import {GetStrategyContract} from '../../../ethereum/EthHelpers';
import {Vault} from '../../useVaults/types';
import {fetchHarvestReportsForStrategy} from '../../../utils/vaults';

export interface HarvestOutput {
	strategy: string,
	flow: {
		profit: BigNumber,
		debt: BigNumber
	},
	apr: {
		gross: number,
		net: number
	},
	estimatedTotalAssets: BigNumber,
	totalDebt: BigNumber
}

export default function useHarvestProbe() {
	const {setStatus} = useSimulatorStatus();

	const probe = useMemo(() => {
		return {
			name: 'harvest',

			stop: async (_results: SimulationResult[], vaults: Vault[], provider: providers.JsonRpcProvider) => {
				const harvestResults = _results.filter(result => 
					result.block.call.signature === functions.strategies.harvest.signature
				);

				setStatus('Compute harvest outputs');
				const results = [] as HarvestOutput[];
				for(const result of harvestResults) {
					if(!result.output) continue;

					const vault = vaults.find(v => v.withdrawalQueue.some(s => s.address === result.block.contract));
					if(!vault) throw '!vault';

					const strategy = vault.withdrawalQueue.find(s => s.address === result.block.contract);
					if(!strategy) throw '!strategy';

					const previousReports = await fetchHarvestReportsForStrategy(vault.network.chainId, vault.address, strategy.address);
					const latestReport = previousReports[0];

					const events = parseEvents(functions.strategies.harvest.events, result.output.events as RawEvent[]);

					const report = events.find(e => e.name === 'StrategyReported');
					if(!report) throw '!report';

					const flow = {
						profit: report.args.loss.mul(-1).add(report.args.gain),
						debt: report.args.debtPaid.mul(-1).add(report.args.debtAdded)
					};

					const apr = computeHarvestApr(vault, strategy, latestReport, {
						gain: report.args.gain,
						loss: report.args.loss
					});

					const contract = GetStrategyContract(strategy.address, provider);
					const estimatedTotalAssets = await contract.estimatedTotalAssets();

					results.push({strategy: strategy.address, flow, apr, estimatedTotalAssets, totalDebt: report.args.totalDebt});
				}

				return {name: 'harvest', output: results};
			}
		} as Probe;
	}, [setStatus]);

	return probe;
}
