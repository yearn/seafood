import React, {useEffect, useState} from 'react';
import {useSelectedProvider} from '../SelectProvider/useSelectedProvider';
import {defaultChips, FilterProvider, useFilter} from '../Vaults/useFilter';
import Filter from '../Vaults/Filter';
import Tile from '../Vaults/Tile';

function Tiles({onSelect}) {
	const {filter} = useFilter();
	return <>
		{filter.map(vault => {
			return <Tile key={vault.address} vault={vault} onClick={() => onSelect(vault)}></Tile>;
		})}
	</>;
}

export default function SelectVault({onSelect}) {
	const {selectedProvider} = useSelectedProvider();
	const [query, setQuery] = useState('');
	const [chips, setChips] = useState(defaultChips());

	useEffect(() => {
		setChips({
			curve: false,
			ethereum: selectedProvider.network.chainId == 1,
			fantom: selectedProvider.network.chainId == 250,
			tags: ['curve']
		});
	}, [selectedProvider]);

	return <FilterProvider query={query} setQuery={setQuery} chips={chips} setChips={setChips}>
		<div className={'max-h-full flex flex-col'}>
			<Filter></Filter>
			<div className={'grow overflow-scroll my-4 grid grid-flow-row grid-cols-1 md:grid-cols-3 2xl:grid-cols-4'}>
				<Tiles onSelect={onSelect}></Tiles>
			</div>
		</div>
	</FilterProvider>;
}