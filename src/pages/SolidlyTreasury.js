import useRPCProvider from '../context/useRpcProvider';
import {FindName, LpState, StakedSex, StakedSolidsex} from '../ethereum/SolidlyCalcs';
//import {fantomMasterchefs} from  '../ethereum/Addresses';
import {fchad, solidsexsolidlp,  volYfiWftmLp,  volYfiWoofyLp} from '../ethereum/Addresses';
import React, {useEffect, useState} from 'react';
import {FormatNumer, GetExplorerLink} from '../utils/utils';
import {sex, solid, wftm, solidsex} from '../ethereum/Addresses';
import {GetPrices} from '../ethereum/PriceFinder';
import {GetBalances} from '../ethereum/EthHelpers';

function SolidlyTreasury(){
	const {fantomProvider} = useRPCProvider();
	// let [allV, setAllv] = useState([]);
	const [lps, setLps] = useState([]);
	const [values, setValues] = useState({});
	const [prices, setPrices] = useState([]);
	const [balances, setBalances] = useState([]);

	const [totals, setTotals] = useState({});
	const [solidsexStaked, setSolidsex] = useState({});
	const [sexStaked, setSex] = useState({});

	const [nonce, setNonce] = useState(0);

	const handleChange = (fieldId) => {
		setValues(currentValues => {
			currentValues[fieldId] = !currentValues[fieldId];
			return currentValues;
		});
		setNonce(nonce+1); //need to force update because react is stupid
	};

	function getAll(provider){
		const tokens = [sex(), solid(), wftm(), solidsex()];

		GetPrices(tokens, provider).then(x =>{
			console.log(x);
			setPrices(x);
		});

		GetBalances(tokens, fchad(), provider).then(x =>{
			console.log(x);
			setBalances(x);
		});

		LpState(solidsexsolidlp(), fchad(), provider).then((x) => { 
			addTotals(x);
			addLp(x);
		});

		LpState(volYfiWoofyLp(), fchad(), provider).then((x) => { 
			addTotals(x);
			addLp(x);
		});

		LpState(volYfiWftmLp(), fchad(), provider).then((x) => { 
			addTotals(x);
			addLp(x);
		});


		StakedSolidsex(fchad(), provider).then((x) =>{
			console.log(x);
			addTotals(x);
			setSolidsex(x);

		});
		StakedSex(fchad(), provider).then((x) =>{
			console.log('ads');
			console.log(x);
			addTotals(x);
			setSex(x);

		});

		
	}

	function addTotals(x){
		setTotals(currentValues => {

			let sexBalance = 0;
			let solidBalance = 0;
			let wftmBalance = 0;
			let solidSexBalance = 0;
			
			if(x.tokenABalance){
				if(x.tokenABalance.address === sex()){
					sexBalance += x.tokenABalance.balance;
				} else if(x.tokenABalance.address === solid()){
					solidBalance += x.tokenABalance.balance;
				} else if(x.tokenABalance.address === wftm()){
					wftmBalance += x.tokenABalance.balance;
				} else if(x.tokenABalance.address === solidsex()){
					solidSexBalance += x.tokenABalance.balance;
				} 
			}

			if(x.tokenBBalance){
				if(x.tokenBBalance.address === sex()){
					sexBalance += x.tokenBBalance.balance;
				} else if(x.tokenBBalance.address === solid()){
					solidBalance += x.tokenBBalance.balance;
				} else if(x.tokenBBalance.address === wftm()){
					wftmBalance += x.tokenBBalance.balance;
				} else if(x.tokenBBalance.address === solidsex()){
					solidSexBalance += x.tokenBBalance.balance;
				} 
			}
			

			if(currentValues.sexRewards){
				currentValues.sexBalance = currentValues.sexBalance+sexBalance;
				currentValues.solidBalance = currentValues.solidBalance+ solidBalance;
				currentValues.wftmBalance = currentValues.wftmBalance+ wftmBalance;
				currentValues.solidSexBalance = currentValues.solidSexBalance+ solidSexBalance;


				currentValues.sexRewards = currentValues.sexRewards + x.sexRewards;
				currentValues.solidRewards = currentValues.solidRewards + x.solidRewards;
				if (x.solidsexRewards){
					currentValues.solidsexRewards = currentValues.solidsexRewards + x.solidsexRewards;
				}
				
			}else{
				currentValues.sexBalance = sexBalance;
				currentValues.solidBalance = solidBalance;
				currentValues.wftmBalance = wftmBalance;
				currentValues.solidSexBalance = solidSexBalance;

				currentValues.solidRewards =  x.solidRewards;
				currentValues.sexRewards =  x.sexRewards;
				if (x.solidsexRewards){
					currentValues.solidsexRewards = x.solidsexRewards;
				}
			}
			
			
			return currentValues;
		});
	}

	function addLp(x){
		console.log(x);
		
			
		setLps(currentValues => {
			return [x, ...currentValues];
		});
	}
	console.log(totals);

	
	

	useEffect(() => {
		getAll(fantomProvider);
	}, [fantomProvider]);

	const divStyle = {
		width: '100%',
		height: '800px'
	};
	if(lps.length > 0 && balances.length >0){
		return <div>
			<h2>{'Total Numbers'}</h2>
			<ul>
				
				<li>{'Started with 250,000 wftm worth: $' + FormatNumer(250_000*prices[wftm()]) }</li>
				<li>{'Started with 1,118,072 solidsex worth: $' + FormatNumer(1118072*prices[solidsex()]) }</li>
				<br />
				<li>{'Total Holdings Now Worth: $' + FormatNumer(totals.solidBalance*prices[solid()] + totals.solidSexBalance*prices[solidsex()]+totals.wftmBalance*prices[wftm()] +totals.sexBalance*prices[sex()] + totals.solidRewards*prices[solid()]+totals.sexRewards*prices[sex()] + sexStaked.solidsexRewards*prices[solidsex()] + 43942*prices[sex()] + balances.reduce((previousValue, currentValue) => previousValue + currentValue.balance*prices[currentValue.token.address], 0)) }</li>
				<br />
				{balances.map(b => (
					<li key={b.token.address}>{'Balance of ' + b.token.name + ' ' + FormatNumer(b.balance) + ' worth: $' + FormatNumer(b.balance*prices[b.token.address])} </li>
				))}
				<li>{'Total Availble Solid = ' + FormatNumer(totals.solidBalance)+ ' worth: $' + FormatNumer(totals.solidBalance*prices[solid()])}</li>
				<li>{'Total Availble Solidsex = ' + FormatNumer(totals.solidSexBalance)+ ' worth: $' + FormatNumer(totals.solidSexBalance*prices[solidsex()]) }</li>
				<li>{'Total Availble Wftm = ' + FormatNumer(totals.wftmBalance) + ' worth: $' + FormatNumer(totals.wftmBalance*prices[wftm()]) }</li>
				<li>{'Total Availble Sex = ' + FormatNumer(totals.sexBalance)+ ' worth: $' + FormatNumer(totals.sexBalance*prices[sex()])}</li>
				<li>{'Total Pending Solid Rewards = ' + FormatNumer(totals.solidRewards)+ ' worth: $' + FormatNumer(totals.solidRewards*prices[solid()])}</li>
				<li>{'Total Pending Sex Rewards = ' + FormatNumer(totals.sexRewards) + ' worth: $' + FormatNumer(totals.sexRewards*prices[sex()])}</li>
				<li>{'Total Pending Solidsex Rewards = ' + FormatNumer(totals.solidsexRewards) + ' worth: $' + FormatNumer(totals.solidsexRewards*prices[solidsex()])}</li>
				<li>{'Total Staked Sex Rewards = ' + FormatNumer(43942) + ' worth: $' + FormatNumer(43942*prices[sex()])}</li>
			</ul>
			
			<br />
			<h2>{'Staked LPS:'}</h2>
			{lps.map((lp) => (
				<div key={lp.address}> <h3>{lp.name}</h3>
					<div>  {'Lp: ' + lp.name }  </div> 
				
					<ul>
						<li><a target={'_blank'} rel={'noreferrer'} href={GetExplorerLink(fantomProvider.network.chainId, lp.address)}> {'lp: ' + lp.address} </a></li>
						<li><a target={'_blank'} rel={'noreferrer'} href={GetExplorerLink(fantomProvider.network.chainId, lp.tokenABalance.address)}> {FindName(lp.tokenABalance.address) + ' balance: ' + FormatNumer(lp.tokenABalance.balance)} </a></li>
						<li><a target={'_blank'} rel={'noreferrer'} href={GetExplorerLink(fantomProvider.network.chainId, lp.tokenBBalance.address)}> {FindName(lp.tokenBBalance.address) + ' balance: ' + FormatNumer(lp.tokenBBalance.balance)} </a></li>
						<li><a target={'_blank'} rel={'noreferrer'} href={GetExplorerLink(fantomProvider.network.chainId, sex())}> {'sex pending rewards: '  + FormatNumer(lp.sexRewards) + ' worth $' + FormatNumer(lp.sexRewards*prices[sex()])} </a></li>
						<li><a target={'_blank'} rel={'noreferrer'} href={GetExplorerLink(fantomProvider.network.chainId, solid())}> {'solid pending rewards: '  + FormatNumer(lp.solidRewards) + ' worth $' + FormatNumer(lp.solidRewards*prices[solid()])} </a></li>
						<li> {'SolidexBoost: ' + FormatNumer(lp.solidsexBoost, 3)+ 'x'}</li>
						<li> {'Price: ' + FormatNumer(lp.price, 4) }</li>
					</ul>
					<br />
					<button onClick={() => handleChange(lp.address)}> {'Toggle dexscreener'}</button>
					{values[lp.address] && <iframe style={divStyle} src={lp.dexScreener}></iframe>}
					<br /></div>
			))}
			<h2>{'Staked Solidsex:'}</h2>
			<div>
				{solidsexStaked && <ul>
					<li><a target={'_blank'} rel={'noreferrer'} href={GetExplorerLink(fantomProvider.network.chainId, solidsex())}> {'staked solidex: '  + FormatNumer(solidsexStaked.tokenABalance.balance)} </a></li>
					<li><a target={'_blank'} rel={'noreferrer'} href={GetExplorerLink(fantomProvider.network.chainId, sex())}> {'sex pending rewards: '  + FormatNumer(solidsexStaked.sexRewards) + ' worth $' + FormatNumer(solidsexStaked.sexRewards*prices[sex()])} </a></li>
					<li><a target={'_blank'} rel={'noreferrer'} href={GetExplorerLink(fantomProvider.network.chainId, solid())}> {'solid pending rewards: '  + FormatNumer(solidsexStaked.solidRewards) + ' worth $' + FormatNumer(solidsexStaked.solidRewards*prices[solid()])} </a></li>
				</ul>}
			</div>
			<h2>{'Staked Sex:'}</h2>
			<div>
				{sexStaked && <ul>
					
					<li><a target={'_blank'} rel={'noreferrer'} href={GetExplorerLink(fantomProvider.network.chainId, solidsex())}> {'solidsex pending rewards: '  + FormatNumer(sexStaked.solidsexRewards) + ' worth $' + FormatNumer(sexStaked.solidsexRewards*prices[solidsex()])} </a></li>
				</ul>}
			</div>
		</div>;
	}else{
		return <div>{'loading...'}</div>;
	}
}

export default SolidlyTreasury;
