import React, {createContext, ReactNode, useContext} from 'react';
import useLocalStorage from 'use-local-storage';

interface IFavoritesContext {
  vaults: string[];
  setVaults: (addresses: string[]) => void;
  strategies: string[];
  setStrategies: (addresses: string[]) => void;
}


const	FavoritesContext = createContext<IFavoritesContext>({} as IFavoritesContext);

export const useFavorites = () => useContext(FavoritesContext);

export default function FavoritesProvider({children} : {children: ReactNode}) {
	const [favoriteVaults, setFavoriteVaults] = useLocalStorage<string[]>('favoriteVaults', []);
	const [favoriteStrategies, setFavoriteStrategies] = useLocalStorage<string[]>('favoriteStrategies', []);
	return <FavoritesContext.Provider value={{
		vaults: favoriteVaults,
		setVaults: setFavoriteVaults,
		strategies: favoriteStrategies,
		setStrategies: setFavoriteStrategies
	}}>
		{children}
	</FavoritesContext.Provider>;
}
