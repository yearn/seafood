import {BigNumber, FixedNumber, providers} from 'ethers';
import {useCallback, useMemo} from 'react';
import {getApyComputer, getEstimatedBlockSamples} from '../../../math/apy';
import {Apy} from '../../../math/apy/types';
import {GetVaultContract} from '../../../ethereum/EthHelpers';
import {fetchHarvestReports} from '../../../utils/vaults';
import {Vault} from '../../useVaults/types';
import {Probe, ProbeResults} from './useProbes';
import {SimulationResult} from '../../../tenderly';
import {useSimulatorStatus} from '../SimulatorStatusProvider';
import {BPS} from '../../../constants';

export interface ApyOutput {
	vault: string,
	apy: Apy
}

export default function useApyProbe() {
	const {setStatus} = useSimulatorStatus();

	const getSamples = useCallback(async (vault: Vault, provider: providers.JsonRpcProvider) => {	
		const reports = await fetchHarvestReports(vault);
		const reportBlocks = reports.map((r: {block: string}) => parseInt(r.block)).sort();
		return await getEstimatedBlockSamples(provider, reportBlocks[0]);
	}, []);

	const measureApy = useCallback(async (vault: Vault, provider: providers.JsonRpcProvider) => {
		const samples = await getSamples(vault, provider);
		const computer = getApyComputer(vault.apy.type);
		const contract = await GetVaultContract(vault.address, provider, vault.version);
		return await computer.compute(vault, contract, samples);
	}, [getSamples]);

	const runApyProbe = useCallback(async (vaults: Vault[], provider: providers.JsonRpcProvider) => {
		const result = [] as ApyOutput[];
		for(const vault of vaults) {
			result.push({
				vault: vault.address,
				apy: await measureApy(vault, provider)
			});
		}
		return result;
	}, [measureApy]);

	const probe = useMemo(() => {
		return {
			name: 'apy',

			start: async (vaults: Vault[], provider: providers.JsonRpcProvider) => {
				setStatus('Compute live APY');
				const result = await runApyProbe(vaults, provider);
				return {name: 'apy', output: result};
			},

			stop: async (_results: SimulationResult[], vaults: Vault[], provider: providers.JsonRpcProvider) => {
				setStatus('Compute future APY');
				const result = await runApyProbe(vaults, provider);
				return {name: 'apy', output: result};
			}
		} as Probe;
	}, [setStatus, runApyProbe]);

	return probe;
}

interface ApyResults {
	start: ApyOutput | undefined,
	stop: ApyOutput | undefined
}

export function useApyProbeResults(vault: Vault, startResults: ProbeResults[], stopResults: ProbeResults[]) {
	return useMemo(() => {
		const start = (startResults
			.find(r => r.name === 'apy')
			?.output as ApyOutput[])
			?.find(o => o.vault === vault.address);

		const stop = (stopResults
			.find(r => r.name === 'apy')
			?.output as ApyOutput[])
			?.find(o => o.vault === vault.address);

		return {start, stop} as ApyResults;
	}, [vault, startResults, stopResults]);
}

export function useApyProbeDelta(vault: Vault, results: ApyResults, useLiveApy: boolean) {
	return useMemo(() => {
		if(!(results.start && results.stop)) return undefined;
		const pps = FixedNumber.from((results.stop.apy.pps as BigNumber)
			.sub(results.start.apy.pps))
			.divUnsafe(FixedNumber.from(results.start.apy.pps))
			.mulUnsafe(BPS)
			.toUnsafeFloat();
	
		const startApy = useLiveApy
			? results.start.apy
			: vault.apy;
	
		return {
			[-7]: results.stop.apy[-7] - startApy[-7],
			[-30]: results.stop.apy[-30] - startApy[-30],
			inception: results.stop.apy.inception - startApy.inception,
			net: results.stop.apy.net - startApy.net,
			gross: results.stop.apy.gross - startApy.gross,
			pps
		};
	}, [vault, results, useLiveApy]);
}
