import React from 'react';
import useLocalStorage from 'use-local-storage';
import {mergeDeep} from '../../utils/mergeDeep';
import {FilterProvider, defaultChips} from './Filter/useFilter';
import List from './List';
import Filter from './Filter';
import Simulator from '../Simulator';
import useScrollOverpass from '../../context/useScrollOverpass';
import SimulatorStatus from '../Simulator/SimulatorStatus';

export default function Vaults() {
	const [query, setQuery] = useLocalStorage('Vaults.filter.query', '');
	const [chips, setChips] = useLocalStorage('Vaults.filter.chips', defaultChips(), {
		parser: (str) => {
			return mergeDeep(defaultChips(), JSON.parse(str));
		}
	});

	const {overpassClassName} = useScrollOverpass();

	return <FilterProvider query={query} setQuery={setQuery} chips={chips} setChips={setChips}>
		<div className={'w-full flex flex-col'}>
			<div className={`sticky top-0 z-10 
				w-full h-full sm:h-[4.25rem] px-3 sm:px-8 flex items-center justify-between gap-3
				${overpassClassName}`}>
				<Filter showVaultCount={false}></Filter>
				<Simulator className={'hidden sm:flex'} />
				<SimulatorStatus className={'hidden sm:flex'} />
			</div>
			<List />
		</div>
	</FilterProvider>;
}