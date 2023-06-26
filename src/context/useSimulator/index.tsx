import {ethers, providers} from 'ethers';
import React, {createContext, ReactNode, useCallback, useContext, useState} from 'react';
import tenderly, {SimulationResult} from '../../tenderly';
import {Block} from './Blocks';
import {useBlocks} from './BlocksProvider';
import {Probe, ProbeResults, useProbes} from './ProbesProvider/useProbes';
import {DEFAULT_STATUS, useSimulatorStatus} from './SimulatorStatusProvider';
import {Vault} from '../useVaults/types';
import {computeDegradationTime} from '../../utils/vaults';
import {getEstimatedBlockSamples} from '../../math/apy';

export interface Simulator {
	simulate: (vaults: Vault[], provider: providers.JsonRpcProvider) => void,
	simulating: boolean,
	blockPointer: Block | null,
	results: SimulationResult[],
	probes: Probe[],
	probeStartResults: ProbeResults[],
	probeStopResults: ProbeResults[],
	reset: () => void,
	initializeAndSimulate: (vaults: Vault[]) => void
}

export const	SimulatorContext = createContext<Simulator>({} as Simulator);

export const useSimulator = () => useContext(SimulatorContext);

export default function SimulatorProvider({children}: {children: ReactNode}) {
	const {setStatus, setTenderlyUrl, setError} = useSimulatorStatus();
	const {blocks} = useBlocks();
	const [blockPointer, setBlockPointer] = useState<Block|null>(null);
	const [results, setResults] = useState<SimulationResult[]>([] as SimulationResult[]);
	const {probes} = useProbes();
	const [probeStartResults, setProbeStartResults] = useState<ProbeResults[]>([]);
	const [probeStopResults, setProbeStopResults] = useState<ProbeResults[]>([]);
	const [simulating, setSimulating] = useState(false);

	const getBlocksPerDay = useCallback(async (provider: providers.JsonRpcProvider) => {
		const samples = await getEstimatedBlockSamples(provider, 0);
		return Math.floor((samples[0] - samples[-7]) / 7);
	}, []);

	const simulate = useCallback(async (vaults: Vault[], provider: providers.JsonRpcProvider) => {
		try {
			setSimulating(true);

			for(const probe of probes) {
				if(probe.start) {
					const result = await probe.start(vaults, provider) as ProbeResults;
					setProbeStartResults(current => [...current, result]);
				}
			}
	
			const results = [] as SimulationResult[];
			for(const block of blocks) {
				const status = block.meta?.['status'] as string;
				if(status) setStatus(status);
				setBlockPointer(block);
				const result = await tenderly.simulate(block, provider);
				results.push(result);
				setResults([...results]);
			}

			const longestDegradation = vaults
				.map(v => computeDegradationTime(v))
				.reduce((a, b) => a.gt(b) ? a : b, ethers.constants.Zero);
			const blocksPerDay = await getBlocksPerDay(provider);
			const blocksToDegradation = Math.floor(longestDegradation.toNumber() * blocksPerDay / (24 * 60 * 60));
			await provider.send('evm_increaseTime', [ethers.utils.hexValue(longestDegradation)]);
			await provider.send('evm_increaseBlocks', [ethers.utils.hexValue(blocksToDegradation)]);
			await provider.send('evm_mine', []);

			setBlockPointer(null);
			for(const probe of probes) {
				const result = await probe.stop(results, vaults, provider) as ProbeResults;
				setProbeStopResults(current => [...current, result]);
			}
	
			setSimulating(false);
			setStatus('Simulation complete');

		} catch (error) {
			console.error(error);
			setSimulating(false);
			setStatus(`${error}`);
			setTenderlyUrl(await tenderly.latestSimulationUrl(provider));
			setError(true);
			return;
		}
	}, [setSimulating, setBlockPointer, setStatus, setTenderlyUrl, setError, setResults, probes, blocks, getBlocksPerDay]);

	const reset = useCallback((resetStatus = true) => {
		setBlockPointer(null);
		setResults([]);
		setProbeStartResults([]);
		setProbeStopResults([]);
		setTenderlyUrl(null);
		setError(false);
		if(resetStatus) {
			setStatus(DEFAULT_STATUS);
		}
	}, [setBlockPointer, setResults, setProbeStartResults, setProbeStopResults, setStatus, setTenderlyUrl, setError]);

	const initializeAndSimulate = useCallback(async (vaults: Vault[]) => {
		setSimulating(true);
		setStatus('Initialize simulator');
		reset(false);
		const provider = await tenderly.createProvider(blocks[0].chain);
		setTimeout(async () => {
			await simulate(vaults, provider);
		}, 1500);
	}, [setSimulating, setStatus, reset, blocks, simulate]);

	return <SimulatorContext.Provider value={{
		simulate, 
		simulating, 
		blockPointer, 
		results,
		probes,
		probeStartResults,
		probeStopResults,
		reset,
		initializeAndSimulate
	}}>
		{children}
	</SimulatorContext.Provider>;
}
