import React, {useEffect, useMemo, useState} from 'react';
import {GetVaultContract} from '../../ethereum/EthHelpers';
import {stepEnum} from './useAddBlockDialog';
import {FunctionTile, StrategyTile} from '../tiles';
import useLocalStorage from '../../utils/useLocalStorage';
import {useApp} from '../../context/useApp';
import Filter from './Filter';
import Header from './Header';
import List from './List';

export default function SelectVaultFunctionOrStrategy({addBlockContext, addBlock}) {
	const {favorites, vaults} = useApp();
	const {selectedProvider, setSteps, result, setResult} = addBlockContext;
	const [items, setItems] = useState([]);
	const [filter, setFilter] = useState([]);
	const [query, setQuery] = useLocalStorage('addBlock.selectStrategy.query', '');
	const queryRe = useMemo(() => { return new RegExp(query, 'i'); }, [query]);
	const [chips, setChips] = useLocalStorage(
		'addBlock.selectStrategy.chips', 
		{favorites: false},
		{defaultKeysOnly: true}
	);

	useEffect(() => {
		(async () => {
			const strategies = vaults.find(v => v.address === result.vault.address).withdrawalQueue
				.map(s => {return {
					type: 'strategy',
					...s
				};});

			const contract = await GetVaultContract(result.vault.address, selectedProvider, result.vault.version);
			const functions = contract.interface.fragments.filter(f => {
				return f.type === 'function' && f.stateMutability !== 'pure' && f.stateMutability !== 'view';
			}).map(f => {return {
				type: 'function',
				...f
			};});

			setItems([...strategies, ...functions]);
		})();
	}, [vaults, selectedProvider, result]);

	useEffect(() => {
		setFilter(items.filter(i => {
			if(query && !queryRe.test(i.name)) return false;
			if(i.type === 'strategy' && chips.favorites && !favorites.strategies.includes(i.address)) return false;
			return true;
		}));
	}, [items, favorites, query, queryRe, chips]);

	function onClickStrategy(strategy) {
		setResult(current => {return {
			...current,
			strategy
		};});
		setSteps(current => {return [
			...current,
			stepEnum.selectStrategyFunction
		];});
	}

	async function onClickFunction(func) {
		func.source = 'vault';
		if(func.inputs.length === 0) {
			addBlock({
				...result,
				strategy: null,
				function: func
			});
		} else {
			setResult(current => {
				return {
					...current,
					strategy: null,
					function: func
				};
			});
			setSteps(current => {return [
				...current,
				stepEnum.setInputs
			];});
		}
	}

	return <>
		<Header>
			<div className={'w-full sm:w-1/3'}>
				<Filter query={query} setQuery={setQuery} chips={chips} setChips={setChips}></Filter>
			</div>
			<div className={'hidden sm:block w-1/3 text-center text-lg font-bold whitespace-nowrap'}>
				<span className={'text-gray-400'}>{`${result.vault.name} / `}</span>
				{'Select a function or strategy'}
			</div>
			<div className={'hidden sm:block w-1/3 flex'}></div>
		</Header>

		<List>
			{filter.map((item, index) => <div key={index}>
				{item.type === 'strategy' && 
					<StrategyTile selectedProvider={selectedProvider} strategy={item} queryRe={queryRe} onClick={() => onClickStrategy(item)}></StrategyTile>}
				{item.type === 'function' && 
					<FunctionTile func={item} queryRe={queryRe} onClick={() => onClickFunction(item)}></FunctionTile>}
			</div>)}
		</List>
	</>;
}