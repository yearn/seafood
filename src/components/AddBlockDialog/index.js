import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import useKeypress from 'react-use-keypress';
import {BsBox} from 'react-icons/bs';
import {useAddBlockDialog, stepEnum, defaultResult} from './useAddBlockDialog';
import {GetVaultContract} from '../../ethereum/EthHelpers';
import {useSelectedProvider} from '../SelectProvider/useSelectedProvider';
import CloseDialog from '../CloseDialog';
import SelectVault from './SelectVault';
import SelectVaultFunctionOrStrategy from './SelectVaultFunctionOrStrategy';
import SelectStrategyFunction from './SelectStrategyFunction';
import SetInputs from './SetInputs';
import Manual from './Manual';
import ReactSwitch from 'react-switch';
import useLocalStorage from 'use-local-storage';

export function AddBlockButton({className}) {
	const location = useLocation();
	const navigate = useNavigate();
	const {setSteps, setResult} = useAddBlockDialog();

	function onClick() {
		setSteps([stepEnum.selectVault]);
		setResult(defaultResult());
		navigate(`${location.pathname}#add-block`);
	}

	return <button onClick={onClick} className={`iconic ${className}`}>
		{'Add block'}
		<BsBox></BsBox>
	</button>;
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

	return <div className={`dialog-container${show ? '' : ' invisible'}`}>
		<div className={'dialog'}>
			<CloseDialog></CloseDialog>
	
			<div className={'grow overflow-y-auto'}>
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
					<ReactSwitch onChange={toggleManual} checked={manual} className={'react-switch'} onColor={'#0084c7'} checkedIcon={false} uncheckedIcon={false} />
					<div onClick={toggleManual} className={'text-sm cursor-default'}>{'Manual'}</div>
				</div>
				<div className={'flex gap-2'}>
					<button disabled={steps.length < 2} onClick={onPreviousStep}>{'< Back'}</button>
					<button disabled={!result?.valid} onClick={onClickAddBlock}>{'Add block'}</button>
				</div>
			</div>
		</div>
		<div onClick={close} className={'absolute -z-10 inset-0'}></div>
	</div>;
}