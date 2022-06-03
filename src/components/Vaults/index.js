import React from 'react';
import useLocalStorage from 'use-local-storage';
import {mergeDeep} from '../../utils/mergeDeep';
import {FilterProvider, defaultChips} from './useFilter';
import List from './List';
import Filter from './Filter';
import './index.css';

export default function Vaults() {
	const [query, setQuery] = useLocalStorage('Vaults.filter.query', '');
	const [chips, setChips] = useLocalStorage('Vaults.filter.chips', defaultChips(), {
		parser: (str) => {
			return mergeDeep(defaultChips(), JSON.parse(str));
		}
	});

	return <FilterProvider query={query} setQuery={setQuery} chips={chips} setChips={setChips}>
		<Filter showVaultCount={true}></Filter>
		<List />
	</FilterProvider>;
}