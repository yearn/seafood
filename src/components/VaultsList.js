import React, {useState,useEffect} from 'react';
import axios from '../axios';
import {BsBoxArrowInUpRight, BsClipboardPlus} from 'react-icons/bs';
import {GetExplorerLink, TruncateAddress} from '../utils/utils';

const curveRe = /urve|crv/;

function VaultButtons({provider, clickFunction}){
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

	return <div>
		<button onClick={() => setShowCurve(!showCurve)}>{showCurve ? 'Show Curve' : 'Hide Curve'}</button>
		<div className={'grid grid-flow-row grid-cols-3 md:grid-cols-3 2xl:grid-cols-5 gap-8'}>
			{filter.map((vault) => {
				return <div 
					key={vault.address} 
					onClick={() => clickFunction(vault)} 
					className={'p-4 border-2 border-sky-100 rounded-md'}>
					{vault.name}{' - '}{vault.version}{' - '}{TruncateAddress(vault.address)}
					<BsClipboardPlus onClick={() => navigator.clipboard.writeText(vault.address)} /><a href={GetExplorerLink(provider, vault.address)}><BsBoxArrowInUpRight /></a>
				</div>;
			})}
		</div>
	</div>;
}



export default VaultButtons;