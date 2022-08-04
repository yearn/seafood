
import React, {useState} from 'react';
import useRPCProvider from '../context/useRpcProvider';
import {AllRegistered} from  '../ethereum/EthHelpers';
import axios from '../axios';

function Settings() {
	const {providers, providerByChainId} = useRPCProvider();
	const [loading, setLoading] = useState(false);

	
  
	const handleChange = (network) => {
		console.log(network);
		const provider = providerByChainId(network);

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
      
		<div className={'p-8 flex gap-2'}>
			{providers?.map(provider => 
				<button key={provider.network.chainId} disabled onClick={() => handleChange(provider.network.chainId)}>
					{'Update '}<span className={'capitalize'}>{provider.network.name}</span>{' Vaults'}
				</button>
			)}
		</div>
        
	);

}

export default Settings;