import React, {useState} from 'react';
import {ethers} from 'ethers';
import {useDebouncedCallback} from 'use-debounce';
import {BsAsterisk, BsCheckLg} from 'react-icons/bs';
import {useSelectedProvider} from '../SelectProvider/useSelectedProvider';
import {GetBasicStrat, GetBasicVault} from '../../ethereum/EthHelpers';
import {useAddBlockDialog, stepEnum} from './useAddBlockDialog';

export default function Manual() {
	const {selectedProvider} = useSelectedProvider();
	const {setSteps, setResult} = useAddBlockDialog();
	const [address, setAddress] = useState({value: null, valid: false, type: ''});
	const [block, setBlock] = useState();

	const debounceAddress = useDebouncedCallback(async (value) => {
		value = value.trim();
		let newBlock = null;
		let valid = false;
		let type = null;

		if(ethers.utils.isAddress(value)) {
			try {
				newBlock = await GetBasicVault(value, selectedProvider);

				// HACK: Looking for a way to infer the contract type 
				// instead of having users select Vault or Strategy. 
				// My assumption here is that strategies never have a governance() function.
				// So if this call fails we go on to check if the address is a strategy.
				await newBlock.contract.callStatic.governance();

				valid = true;
				type = 'vault';
			} catch (error) {
				try {
					newBlock = await GetBasicStrat(value, selectedProvider);
					valid = true;
					type = 'strategy';
				} catch (error) {
					valid = false; //lint sayonara
				}
			}
		}

		setAddress({value, valid, type});
		if(valid) setBlock(newBlock);
		else setBlock(null);
	}, 250);

	function onSelectFunction() {
		switch(address.type) {
		case 'vault': {
			setResult(result => {return {
				...result, 
				vault: block,
				strategy: null
			};});
			setSteps(steps => {return [
				...steps, 
				stepEnum.selectVaultFunctionOrStrategy
			];});
			break;
		}
		case 'strategy': {
			setResult(result => {return {
				...result, 
				vault: null,
				strategy: block
			};});
			setSteps(steps => {return [
				...steps, 
				stepEnum.selectStrategyFunction
			];});
			break;
		}}
	}

	return <div className={'h-full flex flex-col'}>
		<div className={'inputs'}>
			<div className={'scroll-container'}>
				<p className={'pl-8 pr-12 py-4 text-3xl'}>{'Enter a vault or strategy address'}</p>
				<div className={'input flex items-center'}>
					<input type={'text'} onChange={(e) => {debounceAddress(e.target.value);}} placeholder={'address'} />
					<div className={'validation'}>
						{address.valid && <BsCheckLg className={'valid'}></BsCheckLg>}
						{!address.valid && <BsAsterisk className={'invalid'}></BsAsterisk>}
					</div>
				</div>
				<div className={'mt-4 text-lg'}>
					&nbsp;{block?.name}&nbsp;
				</div>
				<button onClick={onSelectFunction} className={address.valid ? 'visible' : 'invisible'}>
					{`Select ${address.type} function`}
				</button>
			</div>
		</div>
	</div>;
}