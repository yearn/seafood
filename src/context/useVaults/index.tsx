import React, {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import * as Comlink from 'comlink';
import * as Seafood from './types';
import {api} from './worker/index';
import {hydrateBigNumbersRecursively} from '../../utils/utils';
import useLocalStorage from 'use-local-storage';
import {RefreshStatus} from './worker/types';

interface VaultsContext {
	refreshing: boolean,
	cachetime: Date,
	vaults: Seafood.Vault[],
	status: RefreshStatus[],
	ytvl: number,
	refresh: () => void
}

function useWorker() {
	return useMemo(() => {
		if(typeof SharedWorker !== 'undefined') {
			const worker = new SharedWorker(new URL('./worker/shared.ts', import.meta.url));
			return Comlink.wrap<typeof api>(worker.port);
		} else {
			const worker = new Worker(new URL('./worker/isolated.ts', import.meta.url));
			return Comlink.wrap<typeof api>(worker);
		}
	}, []);
}

const	vaultsContext = createContext<VaultsContext>({} as VaultsContext);
export const useVaults = () => useContext(vaultsContext);
export default function VaultsProvider({children}: {children: ReactNode}) {
	const [refreshing, setRefreshing] = useState(false);
	const [cachetime, setCachetime] = useLocalStorage<Date>('context/usevaults/cachetime', new Date(0), {
		parser: str => new Date(JSON.parse(str))
	});
	const [vaults, setVaults] = useState<Seafood.Vault[]>([]);
	const [status, setStatus] = useState<RefreshStatus[]>([]);
	const worker = useWorker();

	const callback = useMemo(() => {
		return {
			onRefresh: () => {
				setRefreshing(true);
			},
			onStatus: (status: RefreshStatus[]) => {
				setStatus(status);
			},
			onVaults: (vaults: Seafood.Vault[]) => {
				hydrateBigNumbersRecursively(vaults);
				setVaults(vaults);
			},
			onRefreshed: (date: Date) => {
				setCachetime(date);
				setRefreshing(false);
			}
		};
	}, [setCachetime]);

	useEffect(() => {
		const callbackProxy = Comlink.proxy(callback);
		worker.pushCallback(callbackProxy);

		if(process.env.NODE_ENV === 'development') {
			worker.ahoy().then(result => console.log(result));
		}

		worker.requestStatus();
		worker.requestVaults();
		worker.isRefreshing().then(result => setRefreshing(result));
		worker.isRunning().then(result => {
			if(!result) worker.start({refreshInterval: 5 * 60 * 1000});
		});

		return () => {
			worker.removeCallback(callbackProxy);
		};
	}, [worker, callback]);

	const refresh = useCallback(() => {
		worker.refresh();
	}, [worker]);

	const ytvl = useMemo(() => {
		return vaults
			.map(v => v.tvls ? v.tvls.tvls.slice(-1)[0] : 0)
			.reduce((a, b) => a + b, 0);
	}, [vaults]);

	return <vaultsContext.Provider value={{
		refreshing,
		cachetime,
		vaults,
		status,
		ytvl,
		refresh
	}}>{children}</vaultsContext.Provider>;
}
