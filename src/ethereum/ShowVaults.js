import React, {useState,useEffect} from 'react';
import {AllVaults} from  '../ethereum/EthHelpers';
import useRPCProvider from '../context/useRpcProvider';
import SingleVaultPage from '../pages/SingleVault';


function ShowVault() {
	const {defaultProvider} = useRPCProvider();

	let [allV, setAllv] = useState([]);
	let [singleVault, setSingleVault] = useState(null);
	useEffect(() => {
		AllVaults(defaultProvider).then(v => { setAllv(v);});
	}, [defaultProvider]);

	if(allV.length ==0){
		return(
			<div>{'loading...'}</div>
		);
	}
  
	if(singleVault != null){
		return(
			<div><div><SingleVaultPage value={singleVault} /></div>
				<div><button  onClick={() => setSingleVault(null)}>{'Close '}{singleVault.name}{' - '}{singleVault.version}{' - '}{singleVault.address}</button></div></div>
		);
	}
    
	const listItems = allV.map((vault) =>
		<div key={vault.name}><button  onClick={() => setSingleVault(vault)}> {vault.name}{' - '}{vault.version}{' - '}{vault.address}</button></div>
	);



	return(
      
		<div><h2>{'Preferred Vaults '}</h2>
			<div>{listItems}</div>
		</div>
        
	);

}

export default ShowVault;