import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import useKeypress from 'react-use-keypress';
import {BsBox} from 'react-icons/bs';
import {useAddBlockDialog, stepEnum, defaultResult} from './useAddBlockDialog';
import {GetVaultContract} from '../../ethereum/EthHelpers';
import {useSelectedProvider} from '../SelectProvider/useSelectedProvider';
import SelectVault from './SelectVault';
import SelectVaultFunctionOrStrategy from './SelectVaultFunctionOrStrategy';
import SelectStrategyFunction from './SelectStrategyFunction';
import SetInputs from './SetInputs';
import Manual from './Manual';
import {Button, Dialog, Switch} from '../controls';
import useLocalStorage from 'use-local-storage';

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

export default function AddBlockDialog({onAddBlock}) {
	const location = useLocation();
	const navigate = useNavigate();
	const {selectedProvider} = useSelectedProvider();
	const {steps, setSteps, result} = useAddBlockDialog();
	const currentStep = steps[steps.length - 1];
	const [show, setShow] = useState(false);
	const [manual, setManual] = useLocalStorage('addBlock.manual', false);

	useEffect(() => {
		setShow(location.hash === '#add-block');
	}, [location]);

	useKeypress(['Escape'], close);
	useKeypress(['Enter'], () => {
		if(result.valid) {
			onClickAddBlock();
		}
	});

	function close() {
		navigate(-1);
	}

	function onPreviousStep() {
		setSteps(steps => {
			steps.pop();
			return [...steps];
		});
	}

	async function onClickAddBlock() {
		await addBlock(result);
	}

	async function addBlock(dialogResult) {
		const contract = dialogResult.vault?.contract 
			|| await GetVaultContract(dialogResult.vault.address, selectedProvider);

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
	}

	function toggleManual() {
		setManual(current => !current);
		setSteps([stepEnum.selectVault]);
	}

	return <Dialog show={show}>
		<div className={'grow overflow-y-auto flex flex-col'}>
			{currentStep === stepEnum.selectVault && <>
				{!manual && <SelectVault></SelectVault>}
				{manual && <Manual></Manual>}
			</>}
			{currentStep === stepEnum.selectVaultFunctionOrStrategy && <SelectVaultFunctionOrStrategy addBlock={addBlock}></SelectVaultFunctionOrStrategy>}
			{currentStep === stepEnum.selectStrategyFunction && <SelectStrategyFunction addBlock={addBlock}></SelectStrategyFunction>}
			{currentStep === stepEnum.setInputs && <SetInputs></SetInputs>}
		</div>

		<div className={'flex gap-2 items-center justify-between'}>
			<div className={'flex items-center gap-2'}>
				<Switch onChange={toggleManual} checked={manual} />
				<div onClick={toggleManual} className={'text-sm cursor-default'}>{'Manual'}</div>
			</div>
			<div className={'flex gap-2'}>
				<Button label={'< Back'} disabled={steps.length < 2} onClick={onPreviousStep} />
				<Button label={'Add block'} disabled={!result?.valid} onClick={onClickAddBlock} />
			</div>
		</div>
	</Dialog>;
}