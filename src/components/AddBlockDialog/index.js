import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import useKeypress from 'react-use-keypress';
import {MediumScreen, SmallScreen} from '../../utils/breakpoints';
import CloseDialog from '../CloseDialog';
import SelectVault from './SelectVault';
import SelectVaultFunction from './SelectVaultFunction';
import SelectStrategyFunction from './SelectStrategyFunction';
import {useAddBlockDialog, defaultResult} from './useAddBlockDialog';
import '../Vaults/index.css';

export function AddBlockButton() {
	const location = useLocation();
	const navigate = useNavigate();
	const {setStep, setResult} = useAddBlockDialog();
	function onClick() {
		setStep(0);
		setResult(defaultResult());
		navigate(`${location.pathname}#add-block`);
	}
	return <button onClick={onClick}>{'Add block'}</button>;
}

export default function AddBlockDialog({onAddBlock}) {
	const location = useLocation();
	const navigate = useNavigate();
	const {step, setStep, result, setResult} = useAddBlockDialog();
	const [show, setShow] = useState(false);

	useEffect(() => {
		setShow(location.hash === '#add-block');
	}, [location]);

	useKeypress(['Escape'], close);

	function close() {
		navigate(-1);
	}

	function onSelectVault(vault) {
		setResult(result => {return {...result, vault};});
		nextStep();
	}

	function onSelectFunction(func) {
		setResult(result => {return {...result, func};});
		onAddBlock(result);
		navigate(-1);
	}

	function nextStep() {
		setStep(step => {
			return step + 1;
		});
	}

	function previousStep() {
		setStep(step => {
			return step - 1;
		});
	}

	return <div className={`dialog-container${show ? '' : ' invisible'}`}>
		<div className={'dialog'}>
			<SmallScreen>
				<CloseDialog></CloseDialog>
			</SmallScreen>

			<div className={'grow overflow-auto'}>
				{step === 0 && <SelectVault onSelect={onSelectVault}></SelectVault>}
				{step === 1 && <SelectVaultFunction onSelect={onSelectFunction}></SelectVaultFunction>}
				{step === 2 && <SelectStrategyFunction onSelect={onSelectFunction}></SelectStrategyFunction>}
			</div>

			<div className={'flex items-center justify-end'}>
				<button disabled={step < 1} onClick={previousStep}>{'< Back'}</button>
				<button>{'Manual'}</button>
				<MediumScreen>
					<button onClick={close}>{'Cancel'}</button>
				</MediumScreen>
			</div>
		</div>
		<div onClick={close} className={'absolute -z-10 inset-0'}></div>
	</div>;
}