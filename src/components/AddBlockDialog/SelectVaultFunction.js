import React, {useEffect, useState} from 'react';
import {AllStrats, GetVaultContract} from '../../ethereum/EthHelpers';
import {useSelectedProvider} from '../SelectProvider/useSelectedProvider';
import {useAddBlockDialog, stepEnum} from './useAddBlockDialog';
import StrategyTile from './StrategyTile';
import FunctionTile from './FunctionTile';

export default function SelectVaultFunction() {
	const {selectedProvider} = useSelectedProvider();
	const {setSteps, result, setResult} = useAddBlockDialog();
	const [items, setItems] = useState([]);

	useEffect(() => {
		(async () => {
			const contract = await GetVaultContract(result.vault.address, selectedProvider);
			const block = {
				type: 'Vault',
				address: result.vault,
				name: result.vault.name,
				details: result.vault,
				contract: contract
			};

			const strategies = (await AllStrats(block, selectedProvider))
				.map(s => {return {
					type: 'strategy',
					key: s.name,
					...s
				};});

			const functions = contract.interface.fragments.filter(f => {
				return f.type === 'function' && f.stateMutability !== 'pure' && f.stateMutability !== 'view';
			}).map(f => {return {
				type: 'function',
				key: `${f.name}${f.inputs.map(i => i.name).join('')}`,
				...f
			};});

			setItems([...strategies, ...functions]);
		})();
	}, [selectedProvider, result]);

	function onClickStrategy(strategy) {
		setResult(result => {return {
			...result,
			strategy
		};});
		setSteps(steps => {return [
			...steps,
			stepEnum.selectStrategyFunction
		];});
	}

	function onClickFunction(func) {
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
		<div className={'px-4 pt-4 pb-12 flex items-center'}>
			<h2 className={'text-xl'}>{result.vault.name}</h2>
		</div>
		<div className={'list'}>
			{items.map(item => <div key={item.key}>
				{item.type === 'strategy' && 
					<StrategyTile strategy={item} onClick={() => onClickStrategy(item)}></StrategyTile>}
				{item.type === 'function' && 
					<FunctionTile func={item} onClick={() => onClickFunction(item)}></FunctionTile>}
			</div>)}
		</div>
	</div>;
}