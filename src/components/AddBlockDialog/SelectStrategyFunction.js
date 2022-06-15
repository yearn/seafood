import React, {useEffect, useMemo, useState} from 'react';
import {useAddBlockDialog, stepEnum} from './useAddBlockDialog';
import FunctionTile from './FunctionTile';
import {strategy} from '../../interfaces/interfaces';
import {ethers} from 'ethers';
import {useSelectedProvider} from '../SelectProvider/useSelectedProvider';
import useLocalStorage from 'use-local-storage';
import Filter from './Filter';

export default function SelectStrategyFunction({addBlock}) {
	const {selectedProvider} = useSelectedProvider();
	const {setSteps, result, setResult} = useAddBlockDialog();
	const [items, setItems] = useState([]);
	const [filter, setFilter] = useState([]);
	const [query, setQuery] = useLocalStorage('addBlock.selectFunction.query', '');
	const queryRe = useMemo(() => { return new RegExp(query, 'i'); }, [query]);
	const [chips, setChips] = useLocalStorage('addBlock.selectFunction.chips', {});

	useEffect(() => {
		(async () => {
			const contract = new ethers.Contract(result.strategy.address, strategy, selectedProvider);
			const functions = contract.interface.fragments.filter(f => {
				return f.type === 'function' && f.stateMutability !== 'pure' && f.stateMutability !== 'view';
			}).map(f => {return {
				type: 'function',
				...f
			};});
			setItems(functions);
		})();
	}, [selectedProvider, result]);

	useEffect(() => {
		setFilter(items.filter(i => {
			if(query && !queryRe.test(i.name)) return false;
			return true;
		}));
	}, [items, query, queryRe]);

	function onClickFunction(func) {
		func.source = 'strategy';
		if(func.inputs.length === 0) {
			addBlock({
				...result,
				function: func
			});
		} else {
			setResult(current => {return {
				...current,
				function: func
			};});
			setSteps(current => {return [
				...current,
				stepEnum.setInputs
			];});
		}
	}

	return <div className={'max-h-full flex flex-col'}>
		<div className={'header'}>
			<div className={'w-full sm:w-1/3'}>
				<Filter query={query} setQuery={setQuery} chips={chips} setChips={setChips}></Filter>
			</div>
			<div className={'hidden sm:block w-1/3 text-center text-lg font-bold whitespace-nowrap'}>
				<span className={'text-gray-400'}>{`${result.vault.name} / ${result.strategy.name} / `}</span>
				{'Select a function'}
			</div>
			<div className={'hidden sm:block w-1/3 flex'}></div>
		</div>

		<div className={'tiles'}>
			{filter.map((item, index) => <div key={index}>
				<FunctionTile func={item} queryRe={queryRe} onClick={() => onClickFunction(item)}></FunctionTile>
			</div>)}
		</div>
	</div>;
}