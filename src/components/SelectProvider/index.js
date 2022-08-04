import React, {useState} from 'react';
import useRPCProvider from '../../context/useRpcProvider';
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

	return <select disabled={disabled} value={state} onChange={onChange} className={'capitalize'}>
		{providers.map(provider => 
			<option key={provider.network.chainId} value={provider.network.chainId}>
				{provider.network.name}
			</option>
		)}
	</select>;
}