
import React, {useState} from 'react';
import useRPCProvider from '../context/useRpcProvider';
import {AllRegistered} from  '../ethereum/EthHelpers';
import axios from '../axios';

function Settings() {
	const {defaultProvider, fantomProvider} = useRPCProvider();
	const [loading, setLoading] = useState(false);

	
  
	const handleChange = (network) => {
		console.log(network);
		let provider = network ==1?defaultProvider:fantomProvider;

		try{
			setLoading(true);
			AllRegistered(provider).then(vaults => {
				axios.post('api/getVaults/Update', vaults).then((response) => {
					console.log(response);
					setLoading(false);
				});
			});


		}catch{
			console.log('updating failed');
			setLoading(false);
		}
		
	};
	


	if(loading){
		return (<div>{'Loading...'}</div>);
	}

	return(
      
		<div>
			<button onClick={() => handleChange(250)}> {'Update Fantom Vaults'}</button>
			<button onClick={() => handleChange(1)}> {'Update Ethereum Vaults'}</button>
		</div>
        
	);

}

export default Settings;