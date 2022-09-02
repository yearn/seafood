import axios from 'axios';
import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import useLocalStorage from '../utils/useLocalStorage';
import useRpcProvider from './useRpcProvider';
import {AllStratsFromAllVaults} from  '../ethereum/EthHelpers';

const	AppContext = createContext();
export const useApp = () => useContext(AppContext);
export const AppProvider = ({children}) => {
	const {providers} = useRpcProvider();
	const [loading, setLoading] = useState(false);
	const [cache, setCache] = useLocalStorage('cache', [], {parseBigNumbers: true});
	const [cacheTimestamp, setCacheTimestamp] = useLocalStorage('cacheTimestamp', 0);
	const [vaults, setVaults] = useState([]);
	const [favoriteVaults, setFavoriteVaults] = useLocalStorage('favoriteVaults', []);
	const [favoriteStrategies, setFavoriteStrategies] = useLocalStorage('favoriteStrategies', []);
	const [darkMode, setDarkMode] = useLocalStorage('darkMode', null);

	const cacheExpired = useCallback(() => {
		const cacheExpiration = 15 * 60 * 1000;
		return Date.now() - cacheTimestamp > cacheExpiration;
	}, [cacheTimestamp]);

	const syncCache = useCallback(() => {
		if(!loading) setCacheTimestamp(0);
	}, [loading, setCacheTimestamp]);

	useEffect(() => {
		if(!cacheExpired()) setVaults(cache);
	}, [cache, cacheExpired]);

	useEffect(() => {
		if(providers.length > 0 && cacheExpired()) {
			setCache([]);
			setLoading(true);
			const fetches = providers.map(p => axios.post('/api/getVaults/AllVaults', p.network));
			Promise.all(fetches).then(results => {
				const freshVaults = [];
				providers.forEach((provider, index) => {
					freshVaults.push(...results[index].data.map(v => { 
						return {...v, network: {
							chainId: provider.network.chainId, 
							name: provider.network.name
						}};
					}));
				});

				setCache(freshVaults);
				const strategyPromises = providers.map(p => 
					AllStratsFromAllVaults(freshVaults.filter(v => v.network.name === p.network.name), p));
				Promise.all(strategyPromises).then(result => {
					setCache(result.flat(1));
					setCacheTimestamp(Date.now());
					setLoading(false);
				});
			});
		}
	}, [providers, cacheExpired, setCache, setCacheTimestamp, setLoading]);

	useEffect(() => {
		if(darkMode === null) {
			setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
		}
	}, [darkMode, setDarkMode]);

	return <AppContext.Provider value={{
		loading,
		vaults,
		cacheTimestamp,
		syncCache,
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