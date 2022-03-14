import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import useKeypress from 'react-use-keypress';
import {BsBox} from 'react-icons/bs';
import {BiggerThanSmallScreen, SmallScreen} from '../../utils/breakpoints';
import {useAddBlockDialog, stepEnum, defaultResult} from './useAddBlockDialog';
import {GetVaultContract} from '../../ethereum/EthHelpers';
import {useSelectedProvider} from '../SelectProvider/useSelectedProvider';
import CloseDialog from '../CloseDialog';
import SelectVault from './SelectVault';
import SelectVaultFunctionOrStrategy from './SelectVaultFunctionOrStrategy';
import SelectStrategyFunction from './SelectStrategyFunction';
import SetInputs from './SetInputs';
import Manual from './Manual';

export function AddBlockButton() {
	const location = useLocation();
	const navigate = useNavigate();
	const {setSteps, setResult} = useAddBlockDialog();

	function onClick() {
		setSteps([stepEnum.selectVault]);
		setResult(defaultResult());
		navigate(`${location.pathname}#add-block`);
	}

	return <button onClick={onClick} className={'big iconic'}>
		<BsBox></BsBox>
		{'Add block'}
	</button>;
}

export default function AddBlockDialog({onAddBlock}) {
	const location = useLocation();
	const navigate = useNavigate();
	const {selectedProvider} = useSelectedProvider();
	const {steps, setSteps, result} = useAddBlockDialog();
	const currentStep = steps[steps.length - 1];
	const [show, setShow] = useState(false);

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

	function onManual() {
		const index = steps.indexOf(stepEnum.manual);
		if(index === -1) {
			setSteps(steps => {return [
				steps[0], 
				stepEnum.manual
			];});
		} else {
			setSteps(steps => {return [
				...steps.slice(0, index + 1)
			];});
		}
	}

	async function onClickAddBlock() {
		const contract = result.vault?.contract 
			|| await GetVaultContract(result.vault.address, selectedProvider);

		const block = {
			index: 0,
			name: result.vault.name,
			contract,
			function: result.function,
			inputs: result.function.inputs.reduce((accumulator, current, index) => {
				accumulator[current.name] = result.inputs[index];
				return accumulator;
			}, {})
		};
		block.block = (result.function.source === 'vault') ? block : result.strategy;

		onAddBlock(block);
		navigate(-1);
	}

	return <div className={`dialog-container${show ? '' : ' invisible'}`}>
		<div className={'dialog'}>
			<SmallScreen>
				<CloseDialog></CloseDialog>
			</SmallScreen>

			<div className={'grow overflow-y-auto'}>
				{currentStep === stepEnum.selectVault && <SelectVault></SelectVault>}
				{currentStep === stepEnum.selectVaultFunctionOrStrategy && <SelectVaultFunctionOrStrategy></SelectVaultFunctionOrStrategy>}
				{currentStep === stepEnum.selectStrategyFunction && <SelectStrategyFunction></SelectStrategyFunction>}
				{currentStep === stepEnum.setInputs && <SetInputs></SetInputs>}
				{currentStep === stepEnum.manual && <Manual></Manual>}
			</div>

			<div className={'flex items-center justify-end'}>
				<button disabled={steps.length < 2} onClick={onPreviousStep}>{'< Back'}</button>
				<button onClick={onManual}>{'Manual'}</button>
				<button disabled={!result?.valid} onClick={onClickAddBlock}>{'Add block'}</button>
				<BiggerThanSmallScreen>
					<button onClick={close}>{'Cancel'}</button>
				</BiggerThanSmallScreen>
			</div>
		</div>
		<div onClick={close} className={'absolute -z-10 inset-0'}></div>
	</div>;
}