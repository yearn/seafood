import React, {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import * as Comlink from 'comlink';
import * as ySeafood from './types';
import {api, SyncStatus} from './worker';
import {hydrateBigNumbersRecursively} from '../../utils/utils';
import useLocalStorage from 'use-local-storage';

interface IVaultsContext {
	loading: boolean,
	cachetime: Date,
	vaults: ySeafood.Vault[],
	status: SyncStatus[],
	ytvl: number,
	refresh: () => void
}

const	VaultsContext = createContext<IVaultsContext>({} as IVaultsContext);

export const useVaults = () => useContext(VaultsContext);

export default function VaultsProvider({children}: {children: ReactNode}) {
	const [loading, setLoading] = useState(false);
	const [cachetime, setCachetime] = useLocalStorage<Date>('context/usevaults/cachetime', new Date(0), {
		parser: str => new Date(JSON.parse(str))
	});
	const [vaults, setVaults] = useState<ySeafood.Vault[]>([]);
	const [status, setStatus] = useState<SyncStatus[]>([]);

	const worker = useMemo(() => {
		const worker = new Worker(new URL('./worker.ts', import.meta.url));
		return Comlink.wrap<typeof api>(worker);
	}, []);

	const callbacks = useMemo(() => {
		return {
			startRefresh: () => {
				setLoading(true);
			},
			cacheReady: (date: Date, vaults: ySeafood.Vault[], status: SyncStatus[]) => {
				hydrateBigNumbersRecursively(vaults);
				setCachetime(date);
				setLoading(false);
				setVaults(vaults);
				setStatus(status);
			}
		};
	}, [setCachetime]);

	useEffect(() => {
		if(process.env.NODE_ENV === 'development') {
			worker.ahoy().then(result => console.log(result));
		}
		worker.start({refreshInterval: 5 * 60 * 1000}, Comlink.proxy(callbacks));
	}, [worker, callbacks]);

	const refresh = useCallback(() => {
		worker.refresh(Comlink.proxy(callbacks));
	}, [worker, callbacks]);

	const ytvl = useMemo(() => {
		return vaults
			.map(v => v.tvls ? v.tvls.tvls.slice(-1)[0] : 0)
			.reduce((a, b) => a + b, 0);
	}, [vaults]);

	return <VaultsContext.Provider value={{
		loading,
		cachetime,
		vaults,
		status,
		ytvl,
		refresh
	}}>{children}</VaultsContext.Provider>;
}
