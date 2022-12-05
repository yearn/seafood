import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {useVaults} from '../../context/useVaults';
import {useFavorites} from '../../context/useFavorites';
import {curveRe} from '../../utils/utils';
import config from '../../config';

const	FilterContext = createContext();

export const useFilter = () => useContext(FilterContext);

export function FilterProvider({query, setQuery, chips, setChips, children}) {
	const {vaults} = useVaults();
	const favorites = useFavorites();
	const [filter, setFilter] = useState([]);
	const queryRe = useMemo(() => { return new RegExp(query, 'i'); }, [query]);

	useEffect(() => {
		setFilter(vaults.filter(vault => {
			if(query && !queryRe.test(vault.name)) return false;
			if(chips.favorites && !favorites.vaults.includes(vault.address)) return false;
			if(!chips[vault.network.name]) return false;
			return chips.curve || !curveRe.test(vault.name);
		}));
	}, [query, queryRe, chips, vaults, favorites]);

	return <FilterContext.Provider value={{
		query, 
		queryRe,
		setQuery,
		chips, 
		setChips,
		filter
	}}>{children}</FilterContext.Provider>;
}

export function defaultChips() {
	const result = {
		favorites: false,
		curve: false
	};
	config.chains.forEach(chain => result[chain.name] = true);
	return result;
}