import useRPCProvider from '../context/useRpcProvider';
import {GetMasterchef} from  '../ethereum/EthHelpers';
import {fantomMasterchefs} from  '../ethereum/Addresses';
import React, {useState,useEffect} from 'react';


function MasterchefPage(){
	const {fantomProvider} = useRPCProvider();
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



	useEffect(() => {
		GetMasterchef(fantomMasterchefs(), fantomProvider).then(v => { setAllv(v);});
	}, [fantomProvider]);

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
					<li><a target={'_blank'} rel={'noreferrer'} href={strat.url}> {'Strat: ' + strat.address} </a></li>
					<li><a target={'_blank'} rel={'noreferrer'} href={strat.masterchef.url}> {'Masterchef: ' + strat.masterchef.address} </a></li>
					<li><a target={'_blank'} rel={'noreferrer'} href={strat.emissionToken.url}> {'EmissionToken ' + strat.emissionToken.name + ': '+ strat.emissionToken.address} </a></li>
				</ul>
				<br />
				<button onClick={() => handleChange(strat.address)}> {'Toggle dexscreener'}</button>
				{values[strat.address] && <iframe style={divStyle} src={strat.emissionToken.dexScreener}></iframe>}
				<br /></div>
		))}
		</div>;
	}else{
		return <div>{'loading...'}</div>;
	}
    
    

}

export default MasterchefPage;
