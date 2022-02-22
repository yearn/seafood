import React, {useState,useEffect} from 'react';
import axios from '../axios';
<<<<<<< HEAD
import {BsBoxArrowInUpRight, BsClipboardPlus} from 'react-icons/bs';
import {GetExplorerLink} from '../utils/utils';


=======
import {TruncateAddress} from '../utils/utils';
>>>>>>> WIP

function VaultButtons({provider, clickFunction}){
	const curveRe = /urve|crv/;
	const [showCurve, setShowCurve] = useState(true);
	const [vaults, setVaults] = useState([]);
	const [filter, setFilter] = useState([]);

	useEffect(() => {
		try {
			axios.post('api/getVaults/AllVaults', provider.network).then((response) => {
				setVaults(response.data);
			});
		} catch {
			console.log('eth failed');
		}
	}, [provider]);

	useEffect(() => {
		if(!showCurve) {
			setFilter(vaults.filter(v => !curveRe.test(v.name)));
		} else {
			setFilter(vaults);
		}
	}, [showCurve, vaults]);

	if(vaults.length ==0){
		return(
			<div>{'loading...'}</div>
		);
	}

	return(<div>
		<button  onClick={() => setShowCurve(!showCurve)}>{showCurve ? 'Show Curve' : 'Hide Curve'}</button>
		<div className={'grid grid-flow-row grid-cols-3 md:grid-cols-3 2xl:grid-cols-5 gap-4'}>
			{filter.map((vault) => {
				return <div 
					key={vault.address} 
					onClick={() => clickFunction(vault)} 
					className={'border-2 border-sky-100 rounded'}>
					{vault.name}{' - '}{vault.version}{' - '}{TruncateAddress(vault.address)}
				</div>;
			})}
		</div>
	</div>

	);
}



export default VaultButtons;