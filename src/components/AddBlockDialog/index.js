import React, {useCallback, useMemo} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import useKeypress from 'react-use-keypress';
import {BsBox} from 'react-icons/bs';
import {useAddBlockDialog, stepEnum, defaultResult} from './useAddBlockDialog';
import {GetVaultContract} from '../../ethereum/EthHelpers';
import SelectVault from './SelectVault';
import SelectVaultFunctionOrStrategy from './SelectVaultFunctionOrStrategy';
import SelectStrategyFunction from './SelectStrategyFunction';
import SetInputs from './SetInputs';
import Manual from './Manual';
import {Button, Switch} from '../controls';
import useLocalStorage from 'use-local-storage';
import useScrollOverpass from '../../context/useScrollOverpass';

export function AddBlockButton() {
	const location = useLocation();
	const navigate = useNavigate();
	const {setSteps, setResult} = useAddBlockDialog();

	function onClick() {
		setSteps([stepEnum.selectVault]);
		setResult(defaultResult());
		navigate(`${location.pathname}#add-block`);
	}

	return <Button icon={BsBox} label={'Add block'} onClick={onClick} iconClassName={'text-base'} />;
}

export default function AddBlockDialog({addBlockContext, onAddBlock}) {
	const navigate = useNavigate();
	const {showClassName} = useScrollOverpass();
	const {selectedProvider, steps, setSteps, result} = addBlockContext;
	const [manual, setManual] = useLocalStorage('addBlock.manual', false);

	const currentStep = useMemo(() => {
		return steps[steps.length - 1];
	}, [steps]);

	useKeypress(['Enter'], () => {
		if(result.valid) {
			onClickAddBlock();
		}
	});

	const onPreviousStep = useCallback(() => {
		setSteps(current => {
			return [...current.slice(0, current.length - 1)];
		});
	}, [setSteps]);

	const addBlock = useCallback(async (dialogResult) => {
		const contract = dialogResult.vault?.contract 
			|| await GetVaultContract(dialogResult.vault.address, selectedProvider, dialogResult.vault.version);

		const block = {
			index: 0,
			address: dialogResult.vault.address,
			name: dialogResult.vault.name,
			contract,
			function: dialogResult.function,
			inputs: dialogResult.function.inputs.reduce((accumulator, current, index) => {
				accumulator[current.name] = dialogResult.inputs[index];
				return accumulator;
			}, {})
		};
		block.block = (dialogResult.function.source === 'vault') ? block : dialogResult.strategy;

		onAddBlock(block);
		navigate(-1);
	}, [selectedProvider, onAddBlock, navigate]);

	const onClickAddBlock = useCallback(async () => {
		await addBlock(result);
	}, [addBlock, result]);

	const toggleManual = useCallback(() => {
		setManual(current => !current);
		setSteps([stepEnum.selectVault]);
	}, [setManual, setSteps]);

	return <div className={'relative w-full h-full flex flex-col items-center'}>
		<div className={'grow w-full px-4 pt-2 pb-0 flex flex-col overflow-y-auto'}>
			{currentStep === stepEnum.selectVault && <>
				{!manual && <SelectVault addBlockContext={addBlockContext}></SelectVault>}
				{manual && <Manual addBlockContext={addBlockContext}></Manual>}
			</>}
			{currentStep === stepEnum.selectVaultFunctionOrStrategy && <SelectVaultFunctionOrStrategy addBlock={addBlock} addBlockContext={addBlockContext} />}
			{currentStep === stepEnum.selectStrategyFunction && <SelectStrategyFunction addBlock={addBlock} addBlockContext={addBlockContext} />}
			{currentStep === stepEnum.setInputs && <SetInputs addBlockContext={addBlockContext} />}
		</div>

		<div className={`
			absolute bottom-0 w-full p-4
			flex items-center justify-between
			border-t border-white dark:border-secondary-900
			rounded-b-lg
			bg-secondary-50 dark:bg-secondary-900`}>
			<div className={'flex items-center gap-2'}>
				<Switch onChange={toggleManual} checked={manual} />
				<div onClick={toggleManual} className={'text-sm cursor-default'}>{'Manual'}</div>
			</div>
			<div className={'flex gap-2'}>
				<Button label={'< Back'} disabled={steps.length < 2} onClick={onPreviousStep} />
				<Button label={'Add block'} disabled={!result?.valid} onClick={onClickAddBlock} />
			</div>
		</div>
	</div>;
}