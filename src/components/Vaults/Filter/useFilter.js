import React, {createContext, useContext, useMemo, useState} from 'react';
import useLocalStorage from 'use-local-storage';
import {mergeDeep} from '../../../utils/mergeDeep';
import {useVaults} from '../../../context/useVaults';
import {useFavorites} from '../../../context/useFavorites';
import {curveRe, escapeRegex, factoryRe} from '../../../utils/utils';
import config from '../../../config';

const	FilterContext = createContext();

export const useFilter = () => useContext(FilterContext);

function getLatestTvl(vault) {
	if(!vault.tvls?.tvls?.length) return 0;
	const series = [vault.tvls.dates.slice(-3), vault.tvls.tvls.slice(-3)][1];
	return series[series.length - 1];
}

export function FilterProvider({children}) {
	const {vaults} = useVaults();
	const favorites = useFavorites();
	const [query, setQuery] = useLocalStorage('Vaults.filter.query', '');
	const [chips, setChips] = useLocalStorage('Vaults.filter.chips', defaultChips(), {
		parser: (str) => {
			return mergeDeep(defaultChips(), JSON.parse(str));
		}
	});
	const [ready, setReady] = useState(false);

	const queryRe = useMemo(() => { return new RegExp(escapeRegex(query), 'i'); }, [query]);

	const filter = useMemo(() => {
		if(!vaults.length) return [];

		const result = vaults.filter(vault => {
			const strategyFilter = vault.strategies.reduce((accumulatedTest, strategy) => {
				return queryRe.test(strategy.address) || accumulatedTest;
			}, false);
			
			if(query && !queryRe.test(vault.name) && !queryRe.test(vault.address) && !strategyFilter) return false;
			if(chips.favorites && !favorites.vaults?.includes(vault.address)) return false;
			if(!chips[vault.network.name]) return false;

			const version = parseFloat(vault.version);
			if(!chips.v1 && version < .4) return false;
			if(!chips.v2 && version >= .4 && version < 3) return false;

			if(chips.tvlgtzero && getLatestTvl(vault) <= 0) return false;
			if(chips.warnings && vault.warnings?.length === 0) return false;
			if(chips.rewardsgtzero && vault.rewardsUsd <= 0) return false;
			if(chips.curve && chips.factory) return true;
			if(chips.curve && !chips.factory) return !factoryRe.test(vault.name);
			if(!chips.curve && chips.factory) return factoryRe.test(vault.name);
			return !(curveRe.test(vault.name) || factoryRe.test(vault.name));
		});

		setReady(true);
		return result;
	}, [query, queryRe, chips, vaults, favorites, setReady]);

	return <FilterContext.Provider value={{
		query, 
		queryRe,
		setQuery,
		chips, 
		setChips,
		filter,
		ready
	}}>{children}</FilterContext.Provider>;
}

export function defaultChips() {
	const result = {
		favorites: false,
		curve: false,
		factory: false,
		tvlgtzero: false,
		v1: false,
		v2: true
	};
	config.chains.forEach(chain => result[chain.name] = true);
	return result;
}