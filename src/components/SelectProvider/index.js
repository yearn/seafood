import React, {useState} from 'react';
import useRPCProvider from '../../context/useRpcProvider';
import {useSelectedProvider} from './useSelectedProvider';

export default function SelectProvider({disabled}){
	const {defaultProvider, fantomProvider} = useRPCProvider();
	const {setSelectedProvider} = useSelectedProvider();
	const [state, setState] = useState(1);

	function onChange(e) {
		setState(e.target.value);
		if(e.target.value == 1){
			setSelectedProvider(defaultProvider);
		}else if(e.target.value == 250){
			setSelectedProvider(fantomProvider);
		}
	}

	return <select disabled={disabled} value={state} onChange={onChange}>
		<option value={'1'}>{'Ethereum'}</option>
		<option value={'250'}>{'Fantom'}</option>
	</select>;
}