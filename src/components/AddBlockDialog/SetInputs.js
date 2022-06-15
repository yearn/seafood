import React, {useEffect, useState} from 'react';
import {ethers} from 'ethers';
import {BsAsterisk, BsCheckLg} from 'react-icons/bs';
import {useDebouncedCallback} from 'use-debounce';
import {useAddBlockDialog} from './useAddBlockDialog';
import {BiggerThanSmallScreen, SmallScreen} from '../../utils/breakpoints';

export default function SetInputs() {
	const {result, setResult} = useAddBlockDialog();
	const [inputValues, setInputValues] = useState(result.function.inputs.map(input => {return {
		input,
		value: null,
		valid: false
	};}));

	const debounceInput = useDebouncedCallback(({index, value}) => {
		setInputValues(inputValues => {
			inputValues[index].value = value;
			inputValues[index].valid = validate(result.function.inputs[index], value);
			return [...inputValues];
		});
	}, 250);

	useEffect(() => {
		const valid = inputValues.length === 0 || inputValues.filter(v => !v.valid).length === 0;
		setResult(result => {return {
			...result,
			inputs: inputValues.map(value => value.value),
			valid
		};});
	}, [inputValues, setResult]);

	function validate(input, value) {
		switch(input.type) {
		case 'string':
			return value.length > 0;
		case 'address':
			return ethers.utils.isAddress(value);
		case 'bool':
			return value === 'true' || value === 'false';
		default:
			return !isNaN(value) && ((x) => { return (x | 0) === x; })(parseFloat(value));
		}
	}

	return <div className={'h-full flex flex-col'}>
		<div className={'header'}>
			<div className={'w-full text-center'}>
				<SmallScreen>
					<div className={'text-sm font-bold whitespace-nowrap'}>
						{`${result.vault.name} /`}
					</div>
					<div className={'text-xs font-bold whitespace-nowrap'}>
						{`${result.strategy ? `${result.strategy.name} / ` : ''}${result.function.name}`}
					</div>
				</SmallScreen>
				<BiggerThanSmallScreen>
					<div className={'text-lg font-bold whitespace-nowrap'}>
						{`${result.vault.name} / ${result.strategy ? `${result.strategy.name} / ` : ''}${result.function.name}`}
					</div>
				</BiggerThanSmallScreen>
			</div>
		</div>

		<div className={'inputs'}>
			<div className={'scroll-container'}>
				{result.function.inputs.map((input, index) => 
					<div key={index} className={'input'}>
						<h3 className={'text-lg mb-2'}>{input.name}</h3>
						<div className={'flex items-center'}>
							<input type={'text'} onChange={(e) => {debounceInput({index, value: e.target.value});}} placeholder={input.type} />
							<div className={'validation'}>
								{inputValues[index].valid && <BsCheckLg className={'valid'}></BsCheckLg>}
								{!inputValues[index].valid && <BsAsterisk className={'invalid'}></BsAsterisk>}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	</div>;
}