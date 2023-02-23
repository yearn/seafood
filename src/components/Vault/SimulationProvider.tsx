import {Contract} from 'ethers';
import React, {createContext, ReactNode, useContext} from 'react';
import {useVault} from './VaultProvider';

interface Block {
	contract: Contract,
	signer: string,
	functionCall: () => void,
	functionInput: any[]
}

interface Simulation {
	blocks: Block[]
}

const	SimulationContext = createContext<Simulation>({} as Simulation);

export const useSimulation = () => useContext(SimulationContext);

export default function SimulationProvider({children}: {children: ReactNode}) {
	const {vault, provider, reportBlocks} = useVault();

	return <SimulationContext.Provider value={{}}>
		{children}
	</SimulationContext.Provider>;
}
