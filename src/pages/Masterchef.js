import useRPCProvider from '../context/useRpcProvider';
import {GetMasterchef} from  '../ethereum/EthHelpers';
//import {fantomMasterchefs} from  '../ethereum/Addresses';
import React, {useState, useEffect} from 'react';
import axios from '../axios';
import {chainIds} from '../config';
import {A, Button} from '../components/controls';

function MasterchefPage(){
	const {providerByChainId} = useRPCProvider();
	let [allV, setAllv] = useState([]);
	const [values, setValues] = useState({});
	const [nonce, setNonce] = useState(0);

	const handleChange = (fieldId) => {
		setValues(currentValues => {
			currentValues[fieldId] = !currentValues[fieldId];
			return currentValues;
		});
		setNonce(nonce+1); //need to force update because react is stupid
	};

	function getAll(provider, old){

		try{
			axios.post('api/getVaults/AllMasterchefs', provider.network).then((response) => {
				
				let respons_addresses = response.data.map(x => {
					if(!x.expired || old){
						return x.address;
					}
					
				}).filter(x => x !== undefined);
				console.log(respons_addresses);
				GetMasterchef(respons_addresses, provider, allV).then(v => { setAllv(v);});
                
			});
		}catch{console.log('eth failed');}
		
	}

	function showOld(){
		getAll(providerByChainId(chainIds.fantom), true);
	}

	useEffect(() => {
		getAll(providerByChainId(chainIds.fantom), false);
	}, [providerByChainId]);

	const int = setInterval(() => {
		//getAll();
		console.log('int');
		clearInterval(int);
		//getAll();
	}, 60_000); // update once a block

	const divStyle = {
		width: '100%',
		height: '800px'
	};

	console.log(allV);
	if(allV.length > 0){
		return <div>{allV.map((strat) => (
			<div key={strat.address}> <h3>{strat.name}</h3>
				<div>  {'Deposited: ' + strat.currentDeposits.toLocaleString(undefined, {maximumFractionDigits:2}) + ' '+ strat.wantToken.name + ' which is ' + ((strat.currentDeposits/ strat.totalMasterChefDeposits)*100).toLocaleString(undefined, {maximumFractionDigits:2}) + '% of total deposits' }  </div> 
				<div>  {'Time left: ' + strat.masterchef.timeLeft.toLocaleString(undefined, {maximumFractionDigits:2}) + 'h '}  </div> 
				<ul>
					<li><A target={'_blank'} rel={'noreferrer'} href={strat.url}> {'Strat: ' + strat.address} </A></li>
					<li><A target={'_blank'} rel={'noreferrer'} href={strat.masterchef.url}> {'Masterchef: ' + strat.masterchef.address} </A></li>
					<li><A target={'_blank'} rel={'noreferrer'} href={strat.emissionToken.url}> {'EmissionToken ' + strat.emissionToken.name + ': '+ strat.emissionToken.address} </A></li>
				</ul>
				<br />
				<Button label={'Toggle dexscreener'} onClick={() => handleChange(strat.address)} />
				{values[strat.address] && <iframe style={divStyle} src={strat.emissionToken.dexScreener}></iframe>}
				<br /></div>
		))}
		<Button label={'show expired strats'} onClick={() => showOld()} />
		</div>;
	}else{
		return <div>{'loading...'}</div>;
	}
    
    

}

export default MasterchefPage;
