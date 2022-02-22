import React, {useState} from 'react';
import useRPCProvider from '../context/useRpcProvider';
import SingleVaultPage from '../pages/SingleVault';

import VaultButtons from '../components/VaultsList';


function ShowVault() {
	const {defaultProvider, fantomProvider} = useRPCProvider();

	
	let [singleVault, setSingleVault] = useState(null);
	
  
	if(singleVault != null){
		return(
			<div><div><SingleVaultPage value={singleVault} /></div>
				<div><button  onClick={() => setSingleVault(null)}>{'Close '}{singleVault.name}{' - '}{singleVault.version}{' - '}{singleVault.address}</button></div></div>
		);
	}
	
	return(
      
		<div>
			
			<h2>{'ETH Vaults '}</h2>
			<VaultButtons provider={defaultProvider} clickFunction={setSingleVault} />
			<h2>{'FTM Vaults '}</h2>
			<VaultButtons provider={fantomProvider} clickFunction={setSingleVault} />
		</div>
        
	);

}

export default ShowVault;