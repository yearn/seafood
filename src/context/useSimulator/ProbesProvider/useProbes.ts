import {providers} from 'ethers';
import {createContext, useContext} from 'react';
import {Block} from '../Blocks';

export interface Probe {
	start: (blocks: Block[], provider: providers.JsonRpcProvider) => Promise<object>,
	stop: (blocks: Block[], provider: providers.JsonRpcProvider) => Promise<object>
}

export interface Probes {
	probes: Probe[]
}

export const	ProbesContext = createContext<Probes>({} as Probes);

export const useProbes = () => useContext(ProbesContext);
