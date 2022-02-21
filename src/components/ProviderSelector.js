import React, {useState} from 'react';
import useRPCProvider from '../context/useRpcProvider';


function ProviderSelector({selectFunction}){
	const {defaultProvider, fantomProvider} = useRPCProvider();

	let [selectedProvider, setProivderLocal] = useState(1);

	function handleSubmit(e) {
		setProivderLocal(e.target.value);
		if(e.target.value == 1){
			selectFunction(defaultProvider);
		}else if(e.target.value == 250){
			selectFunction(fantomProvider);
		}
	}
	


	return(<select 
		value={selectedProvider} 
		onChange={handleSubmit} 
	>
		<option value={'1'}>{'Ethereum'}</option>
		<option value={'250'}>{'Fantom'}</option>
		
	</select>

	);
}



export default ProviderSelector;