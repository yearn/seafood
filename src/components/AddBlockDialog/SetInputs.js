import React from 'react';
import {useDebouncedCallback} from 'use-debounce';
import {MediumScreen, SmallScreen} from '../../utils/breakpoints';
import {useAddBlockDialog} from './useAddBlockDialog';

export default function SetInputs({onValidInputs}) {
	const {result} = useAddBlockDialog();
	const debounceInput = useDebouncedCallback(value => {
		onValidInputs({value});
	}, 250);

	return <div className={'max-h-full flex flex-col'}>
		<div className={'px-4 pt-4 pb-8'}>
			<SmallScreen>
				<h2 className={'text-xl'}>{`${result.vault.name} \\`}</h2>
				<h2 className={'text-xl'}>{result.strategy.name}</h2>
			</SmallScreen>
			<MediumScreen>
				<h2 className={'text-xl'}>{`${result.vault.name} \\ ${result.strategy.name}`}</h2>
			</MediumScreen>
		</div>
		<div className={'list'}>
			<input type={'text'} onChange={(e) => {debounceInput(e.target.value);}} defaultValue={''} placeholder={'input'} />
		</div>
	</div>;
}