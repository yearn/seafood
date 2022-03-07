import React, {useEffect} from 'react';
import {AllStrats} from '../../ethereum/EthHelpers';
import {useSelectedProvider} from '../SelectProvider/useSelectedProvider';
import {useDialogContext} from './useDialogContext';

export default function SelectFunction() {
	const {selectedProvider} = useSelectedProvider();
	const {result} = useDialogContext();

	useEffect(() => {
		(async () => {
			console.log('result.vault', result.vault.address);
			const strats = await AllStrats(result.vault, selectedProvider);
			console.log('strats', strats);
		})();
	}, [result]);

	return <>
		<h1 className={'text-xl'}>{result.vault.name}</h1>
		<div></div>
	</>;
}