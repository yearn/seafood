import React, {createContext, ReactNode, useContext, useState} from 'react';

export interface SimulatorStatus {
	status: string,
	setStatus: React.Dispatch<React.SetStateAction<string>>
}

export const simulatorStatusContext = createContext<SimulatorStatus>({} as SimulatorStatus);

export const useSimulatorStatus = () => useContext(simulatorStatusContext);

export const DEFAULT_STATUS = 'Vault simulator idle..';

export default function SimulatorStatusProvider({children}: {children: ReactNode}) {
	const [status, setStatus] = useState(DEFAULT_STATUS);
	return <simulatorStatusContext.Provider value={{status, setStatus}}>
		{children}
	</simulatorStatusContext.Provider>;
}
