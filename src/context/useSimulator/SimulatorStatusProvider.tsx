import React, {createContext, ReactNode, useContext, useState} from 'react';

export interface SimulatorStatus {
	status: string,
	setStatus: React.Dispatch<React.SetStateAction<string>>,
	tenderlyUrl: string | null,
	setTenderlyUrl: React.Dispatch<React.SetStateAction<string | null>>,
	error: boolean,
	setError: React.Dispatch<React.SetStateAction<boolean>>
}

export const simulatorStatusContext = createContext<SimulatorStatus>({} as SimulatorStatus);

export const useSimulatorStatus = () => useContext(simulatorStatusContext);

export const DEFAULT_STATUS = 'Vault simulator idle..';

export default function SimulatorStatusProvider({children}: {children: ReactNode}) {
	const [status, setStatus] = useState(DEFAULT_STATUS);
	const [tenderlyUrl, setTenderlyUrl] = useState<string | null>(null);
	const [error, setError] = useState(false);
	return <simulatorStatusContext.Provider value={{
		status, setStatus,
		tenderlyUrl, setTenderlyUrl,
		error, setError}}>
		{children}
	</simulatorStatusContext.Provider>;
}
