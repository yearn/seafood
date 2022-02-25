import axios from 'axios';
import React, {createContext, useContext, useEffect, useState} from 'react';
import useLocalStorage from 'use-local-storage';
import useRpcProvider from './useRpcProvider';

const	AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({children}) => {
	const {defaultProvider, fantomProvider} = useRpcProvider();
	const [loading, setLoading] = useState(false);
	const [vaults, setVaults] = useState([]);
	const [darkMode, setDarkMode] = useLocalStorage('darkMode', null);

	useEffect(() => {
		(async() => {
			setLoading(true);
			const providers = [defaultProvider, fantomProvider];
			const fetches = providers.map(p => { return axios.post('/api/getVaults/AllVaults', p.network); });
			const results = await Promise.all(fetches);
			const freshVaults = [];
			providers.forEach((p, index) => {
				freshVaults.push(...results[index].data.map(v => { 
					return {...v, provider: p}; 
				}));
			});
			setVaults(freshVaults);
			setLoading(false);
		})();
	}, [defaultProvider, fantomProvider]);

	useEffect(() => {
		if(darkMode === null) {
			setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
		}
	}, [darkMode, setDarkMode]);

	return <AppContext.Provider value={{
		loading,
		vaults,
		darkMode, 
		setDarkMode
	}}>{children}</AppContext.Provider>;
};