import React, {useState, useEffect, useCallback} from 'react';
import {AllStrats, AllVaults} from  '../ethereum/EthHelpers';
import HarvestMultiple from  '../ethereum/HarvestMultiple';
import useRPCProvider from '../context/useRpcProvider';
import RatioAdjust from './RatioAdjusters';
import TenderlySetup from '../ethereum/TenderlyConnect';
import {GetExplorerLink} from '../utils/utils';
import HistoricReports from '../components/HistoricReports';

function SingleVaultPage({value = 250}){
	const {tenderlyProvider, fantomProvider, defaultProvider} = useRPCProvider();
	let provider = value.chain == 250 ? fantomProvider : defaultProvider;
	const [allS, setAlls] = useState([]);
	const [historicHarvests, setHistoricHarvests] = useState([]);
	const [vault, setVault] = useState({});
	const [nonce, setNonce] = useState(0);
	const [harvestedS, setHarvested] = useState([]);
	const [showRatio, toggleRatios] = useState(false);
  

	console.log('inputting ', value);

	//Handle the setAll
	const	onSetAll = useCallback(async () => {
		console.log('sart');
		const vlt = await AllVaults(value, provider);
		console.log(vlt);
		setVault(vlt);
		const	_all = await AllStrats(vlt, provider);
		console.log('changing!');
		console.log(_all);
		setAlls(_all || []);
	}, [value, provider]);
	useEffect(() => onSetAll(), [onSetAll]);

  
	//Handle the button to harvest all
	const	onHarvestMultiple = useCallback(async () => {
		const	_harvested = await HarvestMultiple(allS, vault, tenderlyProvider);
		setHarvested(_harvested || []);
	}, [tenderlyProvider, allS, vault]);

	function showHistoricHarvests(strat){

		try{
			
			setHistoricHarvests(
				currentValues => {
					currentValues[strat] = true;
					return currentValues;
				
				});

			setNonce(nonce+1);
		}catch{console.log('eth failed');}

	}

	const showApr = (strat) => {
		if(!strat.succeded){
			return;
		}

		let profit = strat.paramsAfter.totalGain - strat.beforeGain;
		let loss = strat.paramsAfter.totalLoss - strat.beforeLoss;
		let percent = 0;
		if (strat.beforeDebt > 0) {
			if (loss > profit){
				percent = -1 * loss / strat.beforeDebt; 
			} else {
				percent = profit / strat.beforeDebt;
			}
		}
		let over_year = (100*percent * 8760 / strat.lastTime).toLocaleString(undefined, {maximumFractionDigits:2});    
		return ' APR ' + over_year + '% ';
	};

	if(allS.length == 0) {
		return(<div>{'loading strats...'}</div>);
	}
    
	console.log(allS);
	console.log(vault);
	console.log(harvestedS);

	const listItems = allS.map((strat) => (
		<div key={strat.address}> 
			<br />
			<div>{'Strat: '}{strat.name}{' - '}<a target={'_blank'} href={GetExplorerLink(provider.network.chainId, strat.address)} rel={'noreferrer'}>{strat.address}</a></div>
			<div>{'Lastharvest: '}{strat.lastTime.toLocaleString(undefined, {maximumFractionDigits:2})}{'h - Real ratio: '}{(100*strat.beforeDebt/strat.vaultAssets).toLocaleString(undefined, {maximumFractionDigits:2})}{'% - Desired ratio: '}{(strat.debtRatio/100).toLocaleString(undefined, {maximumFractionDigits:2})}{'% '}</div>
			<div>{harvestedS.length > 0 ? (strat.succeded ? showApr(strat) : 'Failed Harvest ')  : ''} <a target={'_blank'} href={strat.tenderlyURL} rel={'noreferrer'}>{harvestedS.length > 0 && 'Tenderly Link'} </a></div>
			{historicHarvests[strat.address] && <HistoricReports strategy={strat} />}
			{!historicHarvests[strat.address] &&<button onClick={() => showHistoricHarvests(strat.address)}>{'Show historic harvests'}</button>}
		</div>
	));
	
	return(
		<div>
			<TenderlySetup chainId={value.chain} />
			<button disabled={!tenderlyProvider} onClick={onHarvestMultiple}>{' Harvest All?'}</button>
			
			<div>{vault.name}{' - '}{vault.version}{' - '}<a target={'_blank'} href={GetExplorerLink(provider.network.chainId, value.address)} rel={'noreferrer'}> {value.address}</a>{' - '}{(vault.debtRatio/100).toLocaleString(undefined, {maximumFractionDigits:2})}{'% Allocated - Free Assets: '}{((vault.totalAssets - vault.totalDebt) / (10 ** vault.token.decimals)).toLocaleString(undefined, {maximumFractionDigits:2})}</div>
			{console.log('sda2')}
			{console.log(vault)}
			{listItems}

			<div>{showRatio && <RatioAdjust strats={allS} />}</div>
			<div><button onClick={() => toggleRatios(!showRatio)}>{' Adjust Ratios?'}</button></div>
		</div>
	); 
}



export default SingleVaultPage;