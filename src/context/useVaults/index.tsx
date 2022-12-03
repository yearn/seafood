import React, {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import * as Comlink from 'comlink';
import * as ySeafood from './types';
import {api} from './worker';
import {hydrateBigNumbersRecursively} from '../../utils/utils';
import useLocalStorage from 'use-local-storage';

interface IVaultsContext {
	loading: boolean,
	cachetime: Date,
	vaults: ySeafood.Vault[],
	refresh: () => void
}

/* eslint-disable @typescript-eslint/no-empty-function */
const	VaultsContext = createContext<IVaultsContext>({
	loading: false,
	cachetime: new Date(0),
	vaults: [],
	refresh: () => {}
});

export const useVaults = () => useContext(VaultsContext);

export default function VaultsProvider({children}: {children: ReactNode}) {
	const [loading, setLoading] = useState(false);
	const [cachetime, setCachetime] = useLocalStorage<Date>('context/usevaults/cachetime', new Date(0));
	const [vaults, setVaults] = useState<ySeafood.Vault[]>([]);

	const worker = useMemo(() => {
		const worker = new SharedWorker(new URL('./worker.ts', import.meta.url));
		return Comlink.wrap<typeof api>(worker.port);
	}, []);

	const callbacks = useMemo(() => {
		return {
			startRefresh: () => {
				setLoading(true);
			},
			cacheReady: (date: Date, vaults: ySeafood.Vault[]) => {
				hydrateBigNumbersRecursively(vaults);
				setCachetime(date);
				setLoading(false);
				setVaults(vaults);
			}
		};
	}, [setCachetime]);

	useEffect(() => {
		if(process.env.NODE_ENV === 'development') {
			worker.ahoy().then(result => console.log(result));
		}
		worker.start(Comlink.proxy(callbacks));
	}, [worker, callbacks]);

	const refresh = useCallback(() => {
		worker.refresh(callbacks);
	}, [worker, callbacks]);

	return <VaultsContext.Provider value={{
		loading,
		cachetime,
		vaults,
		refresh
	}}>{children}</VaultsContext.Provider>;
}
