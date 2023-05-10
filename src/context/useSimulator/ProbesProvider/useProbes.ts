import {providers} from 'ethers';
import {createContext, useContext} from 'react';
import {SimulationResult} from '../../../tenderly';

export interface ProbeResults {
	name: 'harvest' | 'apy' | 'assets',
	output: object | null
}

export interface Probe {
	name: 'harvest' | 'apy' | 'assets' | 'mock',
	start?: (provider: providers.JsonRpcProvider) => Promise<ProbeResults | void>,
	stop: (results: SimulationResult[], provider: providers.JsonRpcProvider) => Promise<ProbeResults | void>
}

export interface Probes {
	probes: Probe[]
}

export const	ProbesContext = createContext<Probes>({} as Probes);

export const useProbes = () => useContext(ProbesContext);
