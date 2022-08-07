import React, {useState,useEffect} from 'react';
import axios from '../axios';
import {BsBoxArrowInUpRight, BsClipboardPlus} from 'react-icons/bs';
import {getAddressExplorer} from '../utils/utils';



function VaultButtons({provider, clickFunction}){
	let [filterCurve, setFilterCurve] = useState(true);
	let [vaults, setAllv] = useState([]);


	useEffect(() => {
		try{
			axios.post('api/getVaults/AllVaults', provider.network).then((response) => {
				setAllv(response.data);
                
			});
		}catch{console.log('eth failed');}}, [provider]);

	if(vaults.length ==0){
		return(
			<div>{'loading...'}</div>
		);
	}

	return(<div>
		<button  onClick={() => setFilterCurve(!filterCurve)}>{filterCurve ? 'Show Curve' : 'Hide Curve'}</button>
		<div>
			{vaults.map((vault) => {
            
        
				if(filterCurve && (vault.name.includes('urve') || vault.name.includes('crv'))){
					return '';
				}else{
					return <div key={vault.address} className={'flex flex-row items-center'}><button  onClick={() => clickFunction(vault)}> {vault.name}{' - '}{vault.version}{' - '}{vault.address}</button>< BsClipboardPlus onClick={() => navigator.clipboard.writeText(vault.address)} /><a href={getAddressExplorer(provider.network.chainId, vault.address)}>< BsBoxArrowInUpRight   /></a></div>;
				}
			})}</div>
	</div>

	);
}



export default VaultButtons;