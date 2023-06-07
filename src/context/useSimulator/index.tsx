import {providers} from 'ethers';
import React, {createContext, ReactNode, useCallback, useContext, useState} from 'react';
import tenderly, {SimulationResult} from '../../tenderly';
import {Block} from './Blocks';
import {useBlocks} from './BlocksProvider';
import {Probe, ProbeResults, useProbes} from './ProbesProvider/useProbes';
import {DEFAULT_STATUS, useSimulatorStatus} from './SimulatorStatusProvider';

export interface Simulator {
	simulate: (provider: providers.JsonRpcProvider) => void,
	simulating: boolean,
	blockPointer: Block | null,
	results: SimulationResult[],
	probes: Probe[],
	probeStartResults: ProbeResults[],
	probeStopResults: ProbeResults[],
	reset: () => void,
	initializeAndSimulate: () => void
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

	const simulate = useCallback(async (provider: providers.JsonRpcProvider) => {
		try {
			setSimulating(true);

			for(const probe of probes) {
				if(probe.start) {
					const result = await probe.start(provider) as ProbeResults;
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
	
			setBlockPointer(null);
			for(const probe of probes) {
				const result = await probe.stop(results, provider) as ProbeResults;
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
	}, [setSimulating, setBlockPointer, setStatus, setTenderlyUrl, setError, setResults, probes, blocks]);

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

	const initializeAndSimulate = useCallback(async () => {
		setSimulating(true);
		setStatus('Initialize simulator');
		reset(false);
		const provider = await tenderly.createProvider(blocks[0].chain);
		setTimeout(async () => {
			await simulate(provider);
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
