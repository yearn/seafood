import React, {createContext, ReactNode, useContext, useState} from 'react';

export interface SimulatorStatus {
	status: string,
	setStatus: React.Dispatch<React.SetStateAction<string>>
}

export const simulatorStatusContext = createContext<SimulatorStatus>({} as SimulatorStatus);

export const useSimulatorStatus = () => useContext(simulatorStatusContext);

export default function SimulatorStatusProvider({children}: {children: ReactNode}) {
	const [status, setStatus] = useState('Vault simulator idle..');
	return <simulatorStatusContext.Provider value={{status, setStatus}}>
		{children}
	</simulatorStatusContext.Provider>;
}
