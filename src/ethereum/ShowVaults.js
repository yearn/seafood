import React, {useState,useEffect} from 'react';
import useRPCProvider from '../context/useRpcProvider';
import SingleVaultPage from '../pages/SingleVault';
import axios from '../axios';


function ShowVault() {
	const {defaultProvider, fantomProvider} = useRPCProvider();

	let [allV, setAllv] = useState([]);
	let [filterCurve, setFilterCurve] = useState(true);
	let [allFV, setAllFv] = useState([]);
	let [singleVault, setSingleVault] = useState(null);


	useEffect(() => {
		try{
			axios.post('api/getVaults/AllVaults', defaultProvider.network).then((response) => {
				console.log(response.data);
				setAllv(response.data);
				
			});
		}catch{console.log('eth failed');}

		try{

			axios.post('api/getVaults/AllVaults', fantomProvider.network).then((response) => {
				setAllFv(response.data);
			
			});
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
		return <div key={vault.address}><button  onClick={() => setSingleVault(vault)}> {vault.name}{' - '}{vault.version}{' - '}{vault.address}</button></div>;
	}
    
	const ethItems = allV.map((vault) => {
		if(filterCurve && (vault.name.includes('urve') || vault.name.includes('crv'))){
			return '';
		}else{
			return vaultButton(vault);
		}
			
	});

	const ftmItems = allFV.map((vault) => {
		if(filterCurve && (vault.name.includes('urve') || vault.name.includes('crv'))){
			return '';
		}else{
			return vaultButton(vault);
		}
			
	});
	



	return(
      
		<div>
			<button  onClick={() => setFilterCurve(!filterCurve)}>{filterCurve ? 'Show Curve' : 'Hide Curve'}</button>
			<h2>{'ETH Vaults '}</h2>
			<div>{ethItems}</div>
			<h2>{'FTM Vaults '}</h2>
			<div>{ftmItems}</div>
		</div>
        
	);

}

export default ShowVault;