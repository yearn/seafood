import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {useApp} from '../../context/useApp';
import {curveRe} from '../../utils/utils';

const	FilterContext = createContext();

export const useFilter = () => useContext(FilterContext);

export function FilterProvider({query, setQuery, chips, setChips, children}) {
	const {vaults} = useApp();
	const [filter, setFilter] = useState([]);
	const queryRe = useMemo(() => { return new RegExp(query, 'i'); }, [query]);

	useEffect(() => {
		setFilter(vaults.filter(vault => {
			if(query && !queryRe.test(vault.name)) return false;
			if(!chips.ethereum && vault.provider.network.name === 'ethereum') return false;
			if(!chips.fantom && vault.provider.network.name === 'fantom') return false;
			return chips.curve || !curveRe.test(vault.name);
		}));
	}, [query, queryRe, chips, vaults]);

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
	return {
		curve: false,
		ethereum: true,
		fantom: true,
		tags: ['curve', 'ethereum', 'fantom']
	};
}