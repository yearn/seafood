import axios from 'axios';
import React, {createContext, useContext, useEffect, useState} from 'react';
import useLocalStorage from 'use-local-storage';
import useRpcProvider from './useRpcProvider';
import {AllStratsFromAllVaults} from  '../ethereum/EthHelpers';

const	AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({children}) => {
	const {providers} = useRpcProvider();
	const [loading, setLoading] = useState(false);
	const [vaults, setVaults] = useState([]);
	const [favoriteVaults, setFavoriteVaults] = useLocalStorage('favoriteVaults', []);
	const [favoriteStrategies, setFavoriteStrategies] = useLocalStorage('favoriteStrategies', []);
	const [darkMode, setDarkMode] = useLocalStorage('darkMode', null);

	useEffect(() => {
		if(providers.length > 0) {
			setLoading(true);
			const fetches = providers.map(p => axios.post('/api/getVaults/AllVaults', p.network));
			Promise.all(fetches).then(results => {
				const freshVaults = [];
				providers.forEach((provider, index) => {
					freshVaults.push(...results[index].data.map(v => { 
						return {...v, provider};
					}));
				});

				setVaults(freshVaults);
				const strategyPromises = providers.map(p => AllStratsFromAllVaults(freshVaults.filter(v => v.provider.network.name === p.network.name), p));
				Promise.all(strategyPromises).then(result => {
					setVaults(result.flat(1));
				});

				setLoading(false);
			});
		}
	}, [providers]);

	useEffect(() => {
		if(darkMode === null) {
			setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
		}
	}, [darkMode, setDarkMode]);

	return <AppContext.Provider value={{
		loading,
		vaults,
		favorites: {
			vaults: favoriteVaults,
			setVaults: setFavoriteVaults,
			strategies: favoriteStrategies,
			setStrategies: setFavoriteStrategies
		},
		darkMode, 
		setDarkMode
	}}>{children}</AppContext.Provider>;
};