import React, {useState} from 'react';
import useRPCProvider from '../../context/useRpcProvider';
import {Select} from '../controls';
import {useSelectedProvider} from './useSelectedProvider';

export default function SelectProvider({disabled}){
	const {providers} = useRPCProvider();
	const {setSelectedProvider} = useSelectedProvider();
	const [state, setState] = useState(1);

	function onChange(e) {
		setState(e.target.value);
		const provider = providers.find(provider => provider.network.chainId === parseInt(e.target.value));
		setSelectedProvider(provider);
	}

	return <Select 
		disabled={disabled}
		value={state} 
		onChange={onChange}
		options={providers.map(p => ({key: p.network.chainId, value: p.network.name}))}
		className={'capitalize'} />;
}