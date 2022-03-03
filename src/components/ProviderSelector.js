import React, {useState} from 'react';
import useRPCProvider from '../context/useRpcProvider';

function ProviderSelector({setProvider}){
	const {defaultProvider, fantomProvider} = useRPCProvider();
	const [selectedProvider, setProivderLocal] = useState(1);

	function handleSubmit(e) {
		setProivderLocal(e.target.value);
		if(e.target.value == 1){
			setProvider(defaultProvider);
		}else if(e.target.value == 250){
			setProvider(fantomProvider);
		}
	}

	return <select value={selectedProvider} onChange={handleSubmit}>
		<option value={'1'}>{'Ethereum'}</option>
		<option value={'250'}>{'Fantom'}</option>
	</select>;
}

export default ProviderSelector;