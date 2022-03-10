import React, {useEffect, useState} from 'react';
import {useSelectedProvider} from '../SelectProvider/useSelectedProvider';
import {defaultChips, FilterProvider, useFilter} from '../Vaults/useFilter';
import Filter from '../Vaults/Filter';
import Tile from '../Vaults/Tile';
import {useAddBlockDialog, stepEnum} from './useAddBlockDialog';

function Tiles({onSelect}) {
	const {filter} = useFilter();
	return <>
		{filter.map(vault => {
			return <Tile key={vault.address} vault={vault} onClick={() => onSelect(vault)}></Tile>;
		})}
	</>;
}

export default function SelectVault() {
	const {selectedProvider} = useSelectedProvider();
	const {setSteps, setResult} = useAddBlockDialog();
	const [query, setQuery] = useState('');
	const [chips, setChips] = useState({...defaultChips(), tags: ['curve']});

	useEffect(() => {
		setChips({
			curve: false,
			ethereum: selectedProvider.network.chainId == 1,
			fantom: selectedProvider.network.chainId == 250,
			tags: ['curve']
		});
	}, [selectedProvider]);

	function onSelect(vault) {
		setResult(result => {return {...result, vault};});
		setSteps(steps => {return [...steps, stepEnum.selectVaultFunctionOrStrategy];});
	}

	return <FilterProvider query={query} setQuery={setQuery} chips={chips} setChips={setChips}>
		<div className={'max-h-full flex flex-col'}>
			<Filter></Filter>
			<div className={'tiles'}>
				<Tiles onSelect={onSelect}></Tiles>
			</div>
		</div>
	</FilterProvider>;
}