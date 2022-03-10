import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import useKeypress from 'react-use-keypress';
import {BiggerThanSmallScreen, SmallScreen} from '../../utils/breakpoints';
import CloseDialog from '../CloseDialog';
import SelectVault from './SelectVault';
import SelectVaultFunction from './SelectVaultFunction';
import SelectStrategyFunction from './SelectStrategyFunction';
import {useAddBlockDialog, stepEnum, defaultResult} from './useAddBlockDialog';
import {useSelectedProvider} from '../SelectProvider/useSelectedProvider';
import SetInputs from './SetInputs';
import {GetVaultContract} from '../../ethereum/EthHelpers';

export function AddBlockButton() {
	const location = useLocation();
	const navigate = useNavigate();
	const {setSteps, setResult} = useAddBlockDialog();
	function onClick() {
		setSteps([stepEnum.selectVault]);
		setResult(defaultResult());
		navigate(`${location.pathname}#add-block`);
	}
	return <button onClick={onClick}>{'Add block'}</button>;
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
		const block = {
			type: 'Vault',
			index: 0,
			name: result.vault.name,
			details: result.vault,
			address: result.vault.address,
			contract: await GetVaultContract(result.vault.address, selectedProvider),
			function: result.function,
			inputs: {}
		};
		block.block = (result.function.source === 'strategy') ? result.strategy : block;
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
				{currentStep === stepEnum.selectVaultFunctionOrStrategy && <SelectVaultFunction></SelectVaultFunction>}
				{currentStep === stepEnum.selectStrategyFunction && <SelectStrategyFunction></SelectStrategyFunction>}
				{currentStep === stepEnum.setInputs && <SetInputs></SetInputs>}
			</div>

			<div className={'flex items-center justify-end'}>
				<button disabled={steps.length < 2} onClick={onPreviousStep}>{'< Back'}</button>
				<button disabled={!result?.valid} onClick={onClickAddBlock}>{'Add block'}</button>
				<button disabled={true}>{'Manual'}</button>
				<BiggerThanSmallScreen>
					<button onClick={close}>{'Cancel'}</button>
				</BiggerThanSmallScreen>
			</div>
		</div>
		<div onClick={close} className={'absolute -z-10 inset-0'}></div>
	</div>;
}