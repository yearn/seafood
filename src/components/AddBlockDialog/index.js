import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import useKeypress from 'react-use-keypress';
import {MediumScreen, SmallScreen} from '../../utils/breakpoints';
import CloseDialog from '../CloseDialog';
import SelectVault from './SelectVault';
import SelectFunction from './SelectFunction';
import {DialogContext} from './useDialogContext';
import '../Vaults/index.css';

function defaultResult() {
	return {
		vault: null,
		strategy: null,
		function: null,
		block: null,
		inputs: null
	};
}

export function AddBlockButton() {
	const location = useLocation();
	const navigate = useNavigate();
	function onClick() {
		navigate(`${location.pathname}#add-block`);
	}
	return <button onClick={onClick}>{'Add block'}</button>;
}

export default function AddBlockDialog({onAddBlock}) {
	const location = useLocation();
	const navigate = useNavigate();
	const [show, setShow] = useState(false);
	const [step, setStep] = useState(0);
	const [result, setResult] = useState(defaultResult());

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

	function nextStep() {
		setStep(step => {
			return step + 1;
		});
	}

	return <div className={`dialog-container${show ? '' : ' invisible'}`}>
		<div className={'dialog'}>
			<SmallScreen>
				<CloseDialog></CloseDialog>
			</SmallScreen>

			<DialogContext.Provider value={{step, setStep, result, setResult}}>
				<div className={'grow overflow-auto'}>
					{step === 0 && <SelectVault onSelect={onSelectVault}></SelectVault>}
					{step === 1 && <SelectFunction></SelectFunction>}
				</div>
			</DialogContext.Provider>

			<div className={'flex items-center justify-end'}>
				<button>{'Manual'}</button>
				<MediumScreen>
					<button onClick={close}>{'Cancel'}</button>
				</MediumScreen>
				<button onClick={() => onAddBlock(result)}>{'OK'}</button>
			</div>
		</div>
		<div onClick={close} className={'absolute -z-10 inset-0'}></div>
	</div>;
}