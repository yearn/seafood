import {providers} from 'ethers';
import React, {createContext, ReactNode, useCallback, useContext, useMemo, useState} from 'react';
import tenderly, {SimulationResult} from '../../tenderly';
import {Block} from './Blocks';

export interface Probe {
	start: (blocks: Block[], provider: providers.JsonRpcProvider) => Promise<void>,
	end: (blocks: Block[], provider: providers.JsonRpcProvider) => Promise<void>
}

export interface Simulator {
	simulate: (blocks: Block[], provider: providers.JsonRpcProvider) => void,
	simulating: boolean,
	blockPointer: Block | null,
	results: SimulationResult[],
	reset: () => void
}

export const	SimulatorContext = createContext<Simulator>({} as Simulator);

export const useSimulator = () => useContext(SimulatorContext);

export default function SimulatorProvider({probes, children}: {probes: Probe[], children: ReactNode}) {
	const [blockPointer, setBlockPointer] = useState<Block|null>(null);
	const [results, setResults] = useState([] as SimulationResult[]);

	const simulating = useMemo(() => Boolean(blockPointer), [blockPointer]);

	const simulate = useCallback(async (blocks: Block[], provider: providers.JsonRpcProvider) => {
		for(const probe of probes) await probe.start(blocks, provider);

		for(const block of blocks) {
			setBlockPointer(block);
			const result = await tenderly.simulate(block, provider);
			if(result.status === 'ok' && result.block.processResult) {
				result.output = {...result.output, ...await result.block.processResult(result, provider)};
			}
			setResults(current => [...current, result]);
		}

		setBlockPointer(null);
		for(const probe of probes) await probe.end(blocks, provider);
	}, [setBlockPointer, setResults, probes]);

	const reset = useCallback(() => {
		setBlockPointer(null);
		setResults([]);
	}, [setBlockPointer, setResults]);

	return <SimulatorContext.Provider value={{
		simulate, 
		simulating, 
		blockPointer, 
		results, 
		reset
	}}>
		{children}
	</SimulatorContext.Provider>;
}
