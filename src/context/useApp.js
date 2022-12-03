import React, {createContext, useContext} from 'react';
import useLocalStorage from '../utils/useLocalStorage';

const	AppContext = createContext();
export const useApp = () => useContext(AppContext);
export const AppProvider = ({children}) => {
	const [favoriteVaults, setFavoriteVaults] = useLocalStorage('favoriteVaults', []);
	const [favoriteStrategies, setFavoriteStrategies] = useLocalStorage('favoriteStrategies', []);

	return <AppContext.Provider value={{
		cacheTimestamp: new Date(),
		syncCache: () => console.log('meh'),
		favorites: {
			vaults: favoriteVaults,
			setVaults: setFavoriteVaults,
			strategies: favoriteStrategies,
			setStrategies: setFavoriteStrategies
		},
	}}>{children}</AppContext.Provider>;
};