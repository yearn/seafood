import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {useVaults} from '../../context/useVaults';
import {useFavorites} from '../../context/useFavorites';
import {curveRe, escapeRegex, factoryRe} from '../../utils/utils';
import config from '../../config';

const	FilterContext = createContext();

export const useFilter = () => useContext(FilterContext);

export function FilterProvider({query, setQuery, chips, setChips, children}) {
	const {vaults} = useVaults();
	const favorites = useFavorites();
	const [filter, setFilter] = useState([]);
	const queryRe = useMemo(() => { return new RegExp(escapeRegex(query), 'i'); }, [query]);

	useEffect(() => {
		setFilter(vaults.filter(vault => {
			if(query && !queryRe.test(vault.name)) return false;
			if(chips.favorites && !favorites.vaults.includes(vault.address)) return false;
			if(!chips[vault.network.name]) return false;
			if(chips.curve && chips.factory) return true;
			if(chips.curve && !chips.factory) return !factoryRe.test(vault.name);
			if(!chips.curve && chips.factory) return factoryRe.test(vault.name);
			return !(curveRe.test(vault.name) || factoryRe.test(vault.name));
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
		curve: false,
		factory: false,
	};
	config.chains.forEach(chain => result[chain.name] = true);
	return result;
}