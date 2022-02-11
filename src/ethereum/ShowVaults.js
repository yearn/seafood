import React, {useState,useEffect} from 'react';
import {AllVaults} from  '../ethereum/EthHelpers';
import useRPCProvider from '../context/useRpcProvider';
import SingleVaultPage from '../pages/SingleVault';
import {ethVaults, ftmVaults} from './Addresses';


function ShowVault() {
	const {defaultProvider, fantomProvider} = useRPCProvider();

	let [allV, setAllv] = useState([]);
	let [allFV, setAllFv] = useState([]);
	let [singleVault, setSingleVault] = useState(null);


	useEffect(() => {
		try{
			AllVaults(ethVaults(), defaultProvider).then(v => { setAllv(v);});
		}catch{console.log('eth failed');}

		try{
			AllVaults(ftmVaults(), fantomProvider).then(v => { setAllFv(v);});
		}catch{console.log('ftm failed');}
	}, [defaultProvider, fantomProvider]);

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
	function vaultButton(vault){
		return <div key={vault.name}><button  onClick={() => setSingleVault(vault)}> {vault.name}{' - '}{vault.version}{' - '}{vault.address}</button></div>;
	}
    
	const ethItems = allV.map((vault) => vaultButton(vault));
	const ftmItems = allFV.map((vault) => vaultButton(vault));
	



	return(
      
		<div><h2>{'ETH Vaults '}</h2>
			<div>{ethItems}</div>
			<h2>{'FTM Vaults '}</h2>
			<div>{ftmItems}</div>
		</div>
        
	);

}

export default ShowVault;