import {BigNumber, FixedNumber, ethers, providers} from 'ethers';
import {useCallback, useMemo} from 'react';
import {getApyComputer, getSamples} from '../../../math/apy';
import {Apy} from '../../../math/apy/types';
import {GetVaultContract} from '../../../ethereum/EthHelpers';
import {fetchHarvestReports} from '../../../utils/vaults';
import {useVaults} from '../../useVaults';
import {Vault} from '../../useVaults/types';
import {Probe, ProbeResults} from './useProbes';
import {computeDegradationTime} from '../../../utils/vaults';
import {useBlocks} from '../BlocksProvider';
import {SimulationResult} from '../../../tenderly';
import {useSimulatorStatus} from '../SimulatorStatusProvider';
import {BPS} from '../../../constants';

export interface ApyOutput {
	vault: string,
	apy: Apy
}

export default function useApyProbe() {
	const {vaults} = useVaults();
	const {blocks} = useBlocks();
	const {setStatus} = useSimulatorStatus();

	const measureApy = useCallback(async (vault: Vault, provider: providers.JsonRpcProvider) => {
		const reports = await fetchHarvestReports(vault);
		const reportBlocks = reports.map((r: {block: string}) => parseInt(r.block)).sort();
		const samples = await getSamples(provider, reportBlocks);
		const computer = getApyComputer(vault.apy.type);
		const contract = await GetVaultContract(vault.address, provider, vault.version);
		return await computer.compute(vault, contract, samples);
	}, []);

	const vaultsToProbe = useMemo(() => {
		return vaults.filter(vault => {
			const addresses = [vault.address, ...vault.strategies.map(s => s.address)];
			return blocks.some(block => addresses.includes(block.contract));
		});
	}, [blocks, vaults]);

	const runApyProbe = useCallback(async (provider: providers.JsonRpcProvider) => {
		const result = [] as ApyOutput[];
		for(const vault of vaultsToProbe) {
			result.push({
				vault: vault.address,
				apy: await measureApy(vault, provider)
			});
		}
		return result;
	}, [vaultsToProbe, measureApy]);

	const longestDegradationTime = useCallback(() => {
		return vaultsToProbe.map(v => computeDegradationTime(v)).reduce((a, b) => a.gt(b) ? a : b, BigNumber.from(0));
	}, [vaultsToProbe]);

	const probe = useMemo(() => {
		return {
			name: 'apy',

			start: async (provider: providers.JsonRpcProvider) => {
				setStatus('Compute current APYs');
				const result = await runApyProbe(provider);
				return {name: 'apy', output: result};
			},

			stop: async (_results: SimulationResult[], provider: providers.JsonRpcProvider) => {
				setStatus('Compute simulated APYs');
				const degradationTime = longestDegradationTime();
				await provider.send('evm_increaseTime', [ethers.utils.hexValue(degradationTime)]);
				await provider.send('evm_mine', []);
				const result = await runApyProbe(provider);
				return {name: 'apy', output: result};
			}
		} as Probe;
	}, [setStatus, runApyProbe, longestDegradationTime]);

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
