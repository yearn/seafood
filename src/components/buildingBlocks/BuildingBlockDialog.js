import React, {useState} from 'react';
import useKeypress from 'react-use-keypress';
import Tile from '../Vaults/Tile';
import {FilterProvider, defaultChips, useFilter} from '../Vaults/useFilter';
import '../Vaults/index.css';
import Filter from '../Vaults/Filter';

function Tiles() {
	const {filter} = useFilter();
	return <>
		{filter.map(vault => {
			return <Tile key={vault.address} vault={vault}></Tile>;
		})}
	</>;
}

export default function BuildingBlockDialog({state, setState}) {
	const [query, setQuery] = useState('');
	const [chips, setChips] = useState(defaultChips());

	useKeypress(['Escape'], close);

	function close() {
		setState(state => {
			return {...state, show: false};
		});
	}

	return <FilterProvider query={query} setQuery={setQuery} chips={chips} setChips={setChips}>
		<div className={`dialog-container${state.show ? '' : ' invisible'}`}>
			<div className={'dialog'}>	
				<Filter></Filter>
				<div className={'max-h-full overflow-scroll my-4 grid grid-flow-row grid-cols-1 md:grid-cols-3 2xl:grid-cols-4'}>
					<Tiles></Tiles>
				</div>
				<div className={'flex items-center justify-end'}>
					<button>{'Manual'}</button>
					<button onClick={close}>{'Close'}</button>
				</div>
			</div>
			<div onClick={close} className={'absolute -z-10 inset-0'}></div>
		</div>
	</FilterProvider>;
}