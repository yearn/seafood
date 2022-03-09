import React, {useEffect, useState} from 'react';
import {useAddBlockDialog, stepEnum} from './useAddBlockDialog';
import FunctionTile from './FunctionTile';
import {MediumScreen, SmallScreen} from '../../utils/breakpoints';

export default function SelectStrategyFunction() {
	const {setSteps, result, setResult} = useAddBlockDialog();
	const [items, setItems] = useState([]);

	useEffect(() => {
		(async () => {
			const contract = result.strategy.contract;
			const functions = contract.interface.fragments.filter(f => {
				return f.type === 'function' && f.stateMutability !== 'pure' && f.stateMutability !== 'view';
			}).map(f => {return {
				type: 'function',
				key: `${f.name}${f.inputs.map(i => i.name).join('')}`,
				...f
			};});
			setItems(functions);
		})();
	}, [result]);

	function onClickFunction(func) {
		func.source = 'strategy';
		setResult(result => {return {
			...result,
			function: func
		};});
		setSteps(steps => {return [
			...steps,
			stepEnum.setInputs
		];});
	}

	return <div className={'max-h-full flex flex-col'}>
		<div className={'px-4 pt-4 pb-8'}>
			<SmallScreen>
				<h2 className={'text-xl'}>{`${result.vault.name} \\`}</h2>
				<h2 className={'text-xl'}>{result.strategy.name}</h2>
			</SmallScreen>
			<MediumScreen>
				<h2 className={'text-xl'}>{`${result.vault.name} \\ ${result.strategy.name}`}</h2>
			</MediumScreen>
		</div>
		<div className={'list'}>
			{items.map(item => <div key={item.key}>
				<FunctionTile func={item} onClick={() => onClickFunction(item)}></FunctionTile>
			</div>)}
		</div>
	</div>;
}