import React, {useEffect, useMemo, useState} from 'react';
import {useSelectedProvider} from '../SelectProvider/useSelectedProvider';
import Tile from '../Vaults/Tile';
import {useAddBlockDialog, stepEnum} from './useAddBlockDialog';
import {useApp} from '../../context/useApp';
import {curveRe} from '../../utils/utils';
import useLocalStorage from 'use-local-storage';
import Filter from './Filter';

function Tiles({filter, queryRe, onSelect}) {
	return <>
		{filter.map(vault => {
			return <Tile key={vault.address} vault={vault} queryRe={queryRe} onClick={() => onSelect(vault)}></Tile>;
		})}
	</>;
}

export default function SelectVault() {
	const {vaults, favorites} = useApp();
	const [filter, setFilter] = useState([]);
	const {selectedProvider} = useSelectedProvider();
	const {setSteps, setResult} = useAddBlockDialog();
	const [query, setQuery] = useLocalStorage('addBlock.selectVault.query', '');
	const queryRe = useMemo(() => { return new RegExp(query, 'i'); }, [query]);
	const [chips, setChips] = useLocalStorage('addBlock.selectVault.chips', {
		favorites: false,
		curve: false,
		tags: ['curve']
	});

	useEffect(() => {
		setFilter(vaults.filter(vault => {
			if(query && !queryRe.test(vault.name)) return false;
			if(chips.favorites && !favorites.vaults.includes(vault.address)) return false;
			if(selectedProvider.network.name != vault.provider.network.name) return false;
			return chips.curve || !curveRe.test(vault.name);
		}));
	}, [selectedProvider, query, queryRe, chips, vaults, favorites]);

	function onSelect(vault) {
		setResult(result => {return {...result, vault};});
		setSteps(steps => {return [...steps, stepEnum.selectVaultFunctionOrStrategy];});
	}

	return <div className={'max-h-full flex flex-col'}>
		<div className={'header'}>
			<div className={'w-full sm:w-1/3'}>
				<Filter query={query} setQuery={setQuery} chips={chips} setChips={setChips}></Filter>
			</div>
			<div className={'hidden sm:block w-1/3 text-center text-lg font-bold'}>{'Select a vault'}</div>
			<div className={'hidden sm:block w-1/3 flex'}></div>
		</div>
		<div className={'tiles'}>
			<Tiles filter={filter} queryRe={queryRe} onSelect={onSelect}></Tiles>
		</div>
	</div>;
}