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
		<button onClick={() => setShowCurve(!showCurve)}>{showCurve ? 'Hide Curve' : 'Show Curve'}</button>
		<div className={'max-w-prose mx-auto grid grid-flow-row grid-cols-1 md:grid-cols-1 2xl:grid-cols-1 gap-8'}>
			{filter.map((vault) => {
				return <div key={vault.address} 
					className={'vault-row'}>
					<div onClick={() => clickFunction(vault)} className={'title-button'}>
						<div className={'title'}>{vault.name}</div>
						<div className={'version'}>{vault.version}</div>
					</div>
					<div className={'flex items-center address'}>
						{TruncateAddress(vault.address)}
						<BsClipboardPlus title={`Copy ${vault.address} to your clipboard`} onClick={() => navigator.clipboard.writeText(vault.address)} />
						<a href={GetExplorerLink(provider, vault.address)} title={`Explore ${vault.address}`}><BsBoxArrowInUpRight /></a>
						<a href={'https://google.com'}>{'Google!'}</a>
					</div>
				</div>;
			})}
		</div>
	</div>;
}



export default VaultButtons;