import useRPCProvider from '../context/useRpcProvider';
import {FindName, LpState, StakedSex, StakedSolidsex, StakedVeNft} from '../ethereum/SolidlyCalcs';
//import {fantomMasterchefs} from  '../ethereum/Addresses';
import {fchad, solidsexsolidlp,  volYfiWftmLp,  volYfiWoofyLp} from '../ethereum/Addresses';
import React, {useEffect, useState} from 'react';
import {formatNumber, getAddressExplorer} from '../utils/utils';
import {sex, solid, wftm, solidsex} from '../ethereum/Addresses';
import {GetPrices} from '../ethereum/PriceFinder';
import {GetBalances} from '../ethereum/EthHelpers';
import {chainIds} from '../config';
import {A, Button} from '../components/controls';

function SolidlyTreasury(){
	const {providerByChainId} = useRPCProvider();
	// let [allV, setAllv] = useState([]);
	const [lps, setLps] = useState([]);
	const [values, setValues] = useState({});
	const [prices, setPrices] = useState([]);
	const [balances, setBalances] = useState([]);

	const [totals, setTotals] = useState({});
	const [solidsexStaked, setSolidsex] = useState({});
	const [solidNft, setSolidNft] = useState({});
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

		StakedVeNft(fchad(), provider).then((x) =>{
			addTotals(x);
			setSolidNft(x);
			console.log('nft', x);
			

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
	

			if(currentValues.sexRewards >= 0){
				if(currentValues.solidBalance >0){
					console.log('sadsssa', solidBalance);
				}
				currentValues.sexBalance = currentValues.sexBalance+sexBalance;
				currentValues.solidBalance = currentValues.solidBalance+ solidBalance;
				currentValues.wftmBalance = currentValues.wftmBalance+ wftmBalance;
				currentValues.solidSexBalance = currentValues.solidSexBalance+ solidSexBalance;


				currentValues.sexRewards = currentValues.sexRewards + x.sexRewards;
				currentValues.solidRewards = currentValues.solidRewards + x.solidRewards;
				if (currentValues.solidsexRewards >= 0 && x.solidsexRewards >= 0){
					currentValues.solidsexRewards = currentValues.solidsexRewards + x.solidsexRewards;
				}else if (x.solidsexRewards >= 0) {
					currentValues.solidsexRewards = x.solidsexRewards;
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
	console.log('totals', totals);

	
	

	useEffect(() => {
		getAll(providerByChainId(chainIds.fantom));
	}, [providerByChainId]);

	const divStyle = {
		width: '100%',
		height: '800px'
	};
	if(lps.length > 0 && balances.length >0){
		return <div>
			<h2>{'Total Numbers'}</h2>
			<ul>
				
				<li>{'Started with 250,000 wftm worth: $' + formatNumber(250_000*prices[wftm()]) }</li>
				<li>{'Started with 1,118,072 solidsex worth: $' + formatNumber(1118072*prices[solidsex()]) }</li>
				<br />
				<li>{'Total Holdings Now Worth: $' + formatNumber(totals.solidBalance*prices[solid()] + totals.solidSexBalance*prices[solidsex()]+totals.wftmBalance*prices[wftm()] +totals.sexBalance*prices[sex()] + totals.solidRewards*prices[solid()]+totals.sexRewards*prices[sex()] + sexStaked.solidsexRewards*prices[solidsex()] + 43942*prices[sex()] + balances.reduce((previousValue, currentValue) => previousValue + currentValue.balance*prices[currentValue.token.address], 0)) }</li>
				<br />
				{balances.map(b => (
					<li key={b.token.address}>{'Balance of ' + b.token.name + ' ' + formatNumber(b.balance) + ' worth: $' + formatNumber(b.balance*prices[b.token.address])} </li>
				))}
				<li>{'Total Availble Solid = ' + formatNumber(totals.solidBalance)+ ' worth: $' + formatNumber(totals.solidBalance*prices[solid()])}</li>
				<li>{'Total Availble Solidsex = ' + formatNumber(totals.solidSexBalance)+ ' worth: $' + formatNumber(totals.solidSexBalance*prices[solidsex()]) }</li>
				<li>{'Total Availble Wftm = ' + formatNumber(totals.wftmBalance) + ' worth: $' + formatNumber(totals.wftmBalance*prices[wftm()]) }</li>
				<li>{'Total Availble Sex = ' + formatNumber(totals.sexBalance)+ ' worth: $' + formatNumber(totals.sexBalance*prices[sex()])}</li>
				<li>{'Total Pending Solid Rewards = ' + formatNumber(totals.solidRewards)+ ' worth: $' + formatNumber(totals.solidRewards*prices[solid()])}</li>
				<li>{'Total Pending Sex Rewards = ' + formatNumber(totals.sexRewards) + ' worth: $' + formatNumber(totals.sexRewards*prices[sex()])}</li>
				<li>{'Total Pending Solidsex Rewards = ' + formatNumber(totals.solidsexRewards) + ' worth: $' + formatNumber(totals.solidsexRewards*prices[solidsex()])}</li>
				<li>{'Total Staked Sex Rewards = ' + formatNumber(43942) + ' worth: $' + formatNumber(43942*prices[sex()])}</li>
			</ul>
			
			<br />
			<h2>{'Staked LPS:'}</h2>
			{lps.map((lp) => (
				<div key={lp.address}> <h3>{lp.name}</h3>
					<div>  {'Lp: ' + lp.name }  </div> 
				
					<ul>
						<li><A target={'_blank'} rel={'noreferrer'} href={getAddressExplorer(chainIds.fantom, lp.address)}> {'lp: ' + lp.address} </A></li>
						<li><A target={'_blank'} rel={'noreferrer'} href={getAddressExplorer(chainIds.fantom, lp.tokenABalance.address)}> {FindName(lp.tokenABalance.address) + ' balance: ' + formatNumber(lp.tokenABalance.balance)} </A></li>
						<li><A target={'_blank'} rel={'noreferrer'} href={getAddressExplorer(chainIds.fantom, lp.tokenBBalance.address)}> {FindName(lp.tokenBBalance.address) + ' balance: ' + formatNumber(lp.tokenBBalance.balance)} </A></li>
						<li><A target={'_blank'} rel={'noreferrer'} href={getAddressExplorer(chainIds.fantom, sex())}> {'sex pending rewards: '  + formatNumber(lp.sexRewards) + ' worth $' + formatNumber(lp.sexRewards*prices[sex()])} </A></li>
						<li><A target={'_blank'} rel={'noreferrer'} href={getAddressExplorer(chainIds.fantom, solid())}> {'solid pending rewards: '  + formatNumber(lp.solidRewards) + ' worth $' + formatNumber(lp.solidRewards*prices[solid()])} </A></li>
						<li> {'Solidex Boost: ' + formatNumber(lp.solidsexBoost, 3)+ 'x'}</li>
						<li> {'OxDao Boost: ' + formatNumber(lp.oxdaoBoost, 3)+ 'x'}</li>
						<li> {'Price: ' + formatNumber(lp.price, 4) }</li>
					</ul>
					<br />
					<Button label={'Toggle dexscreener'} onClick={() => handleChange(lp.address)} />
					{values[lp.address] && <iframe style={divStyle} src={lp.dexScreener}></iframe>}
					<br /></div>
			))}
			<h2>{'Staked Solidsex:'}</h2>
			<div>
				{solidsexStaked && <ul>
					<li><A target={'_blank'} rel={'noreferrer'} href={getAddressExplorer(chainIds.fantom, solidsex())}> {'staked solidex: '  + formatNumber(solidsexStaked.tokenABalance.balance)} </A></li>
					<li><A target={'_blank'} rel={'noreferrer'} href={getAddressExplorer(chainIds.fantom, sex())}> {'sex pending rewards: '  + formatNumber(solidsexStaked.sexRewards) + ' worth $' + formatNumber(solidsexStaked.sexRewards*prices[sex()])} </A></li>
					<li><A target={'_blank'} rel={'noreferrer'} href={getAddressExplorer(chainIds.fantom, solid())}> {'solid pending rewards: '  + formatNumber(solidsexStaked.solidRewards) + ' worth $' + formatNumber(solidsexStaked.solidRewards*prices[solid()])} </A></li>
				</ul>}
			</div>
			<h2>{'Staked Sex:'}</h2>
			<div>
				{sexStaked && <ul>
					
					<li><A target={'_blank'} rel={'noreferrer'} href={getAddressExplorer(chainIds.fantom, solidsex())}> {'solidsex pending rewards: '  + formatNumber(sexStaked.solidsexRewards) + ' worth $' + formatNumber(sexStaked.solidsexRewards*prices[solidsex()])} </A></li>
				</ul>}
			</div>
			<h2>{'Staked Nft:'}</h2>
			<div>
				{solidNft && <ul>
					
					<li><A target={'_blank'} rel={'noreferrer'} href={getAddressExplorer(chainIds.fantom, solid())}> {'staked solid Nft: '  + formatNumber(solidNft.tokenABalance.balance) + ' worth $' + formatNumber(solidNft.tokenABalance.balance*prices[solid()])} </A></li>
				</ul>}
			</div>
		</div>;
	}else{
		return <div>{'loading...'}</div>;
	}
}

export default SolidlyTreasury;
