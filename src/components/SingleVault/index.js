import React, {useState, useEffect, useCallback} from 'react';
import useLocalStorage from 'use-local-storage';
import TimeAgo from 'react-timeago';
import {TbHistory, TbTractor} from 'react-icons/tb';
import {AllStrats, AllVaults} from  '../../ethereum/EthHelpers';
import HarvestMultiple from  '../../ethereum/HarvestMultiple';
import useRPCProvider from '../../context/useRpcProvider';
import RatioAdjust from '../../pages/RatioAdjusters';
import {FormatNumer, FormatPercent, GetExplorerLink} from '../../utils/utils';
import HistoricReports from '../../components/HistoricReports';
import {setupTenderly, TenderlySim} from '../../ethereum/TenderlySim';
import ShowEvents from '../../components/ShowEvents';
import axios from '../../axios';
import InfoChart from '../../components/Vaults/InfoChart';
import css from './index.module.css';
import ReactSwitch from 'react-switch';

const bps = 0.0001;

function SingleVaultPage({value}){
	const {fantomProvider, defaultProvider} = useRPCProvider();

	const provider = value.chain == 250 ? fantomProvider : defaultProvider;
	const [allS, setAlls] = useState([]);
	const [historicHarvests, setHistoricHarvests] = useState([]);
	const [showHistoricHarvests, setShowHistoricHarvests] = useState([]);
	const [vault, setVault] = useState({});
	const [nonce, setNonce] = useState(0);
	const [harvestedS, setHarvested] = useState([]);
	const [showRatio, toggleRatios] = useState(false);
	const [zeros, setStateZeros] = useState({});
	const [showGraphs, setShowGraphs] = useLocalStorage('SingleVault.settings.showGraphs', false);

	useEffect(() => {
		if(value.address && provider){
			AllVaults(value, provider).then(x => {
				setVault(x);
			});
		}
	}, [value, provider]);

	useEffect(() => {
		if(vault.address && provider){
			AllStrats(vault, provider).then(y => {
				y.sort((a, b) => a.lastTime - b.lastTime);
				setAlls(y || []);
				y.forEach(strategy => {
					axios.post('api/getVaults/AllStrategyReports', strategy).then((response) => {
						//console.log(response.data);
						setHistoricHarvests(
							currentValues => {
								currentValues[strategy.address] = response.data;
								return currentValues;
							
							});
						setNonce(nonce+Math.random(100));
			
					});
				});
			});
		}
	}, [vault, provider]);

	function runSimZero(strat){
		let blocks = [];
		let extended1 = JSON.parse(JSON.stringify(vault));
		
		//updateDebtRatio
		let extended = JSON.parse(JSON.stringify(vault));
		let block = vault;
		extended.block = block;
		extended.contract = vault.contract;
		extended.function = vault.contract.interface.fragments.find(x => x.name === 'updateStrategyDebtRatio');
		let s = [];
		s['asd'] = {};
		s['asd']['strategy'] = strat.address;
		s['asd']['debtRatio'] = '0';
		extended.inputs = s['asd'];
		
		blocks.push(extended);

		//harvest
		
		let block1 = strat;
		extended1.block = block1;
		extended1.contract = vault.contract;
		
		extended1.function = strat.contract.interface.fragments.find(x => x.name === 'harvest');
		
		blocks.push(extended1);
				
		
		setupTenderly(provider.network.chainId).then(tenderlyProvider =>{
			TenderlySim(blocks, tenderlyProvider).then(x =>{
				console.log(x);
				setStateZeros(currentValues => {
					currentValues[strat.address] = x[1];
					return currentValues;
				});
				setNonce(nonce+Math.random(100));
			});
		});

	}
  
	//Handle the button to harvest all
	const	onHarvestMultiple = useCallback(async () => {
		const tenderly = await setupTenderly(provider.network.chainId);
		const	_harvested = await HarvestMultiple(allS, vault, tenderly);
		setHarvested(_harvested || []);
	}, [allS, vault, provider]);

	function clickShowHistoricHarvests(strat){

		try{
			
			setShowHistoricHarvests(
				currentValues => {
					currentValues[strat] = true;
					return currentValues;
				
				});

			setNonce(nonce+1);
		}catch{console.log('eth failed');}

	}

	const showTotalApr = () => {

		let total_weighted_apr = 0;
		let total_user_apr = 0;

		for(const strat of allS){
			let fee= getApr(strat);
			let beforeFee = fee.beforeFee;
			let afterFee = fee.afterFee;
			
			total_weighted_apr += beforeFee*strat.beforeDebt;
			total_user_apr += afterFee*strat.beforeDebt;

		}

		let apr = total_weighted_apr/vault.totalAssets;
		let after = total_user_apr/vault.totalAssets;
		return 'Total Vault APR Before Fees: ' + apr.toLocaleString(undefined, {maximumFractionDigits:2}) + '%, After Fees: ' + after.toLocaleString(undefined, {maximumFractionDigits:2}) + '%';

	};

	const showApr = (strat) => {
		if(!strat.succeded){
			return;
		}
		let fee= getApr(strat);
		let beforeFee = fee.beforeFee;
		let afterFee = fee.afterFee;

		beforeFee = beforeFee.toLocaleString(undefined, {maximumFractionDigits:2});
		afterFee = afterFee.toLocaleString(undefined, {maximumFractionDigits:2});
		
		return 'before-fee APR: ' + beforeFee + '%, after-fee APR ' + afterFee + '%';
	};

	function getApr(strat){
		if(!strat.succeded){
			return {beforeFee: 0, afterFee: 0};
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
		let over_year = (100*percent * 8760 / strat.lastTime);

		let delegated_percent = strat.delegatedAssets/strat.beforeDebt;
		let user_apr = (over_year*0.8) - (2*(1-delegated_percent));
		user_apr = user_apr > 0 ? user_apr : 0;
		return {beforeFee: over_year, afterFee: user_apr};    

	}

	if(allS.length == 0 ) {
		return(<div>
			{vault.address && <div>{vault.name}{' - '}{vault.version}{' - '}<a target={'_blank'} href={GetExplorerLink(provider.network.chainId, value.address)} rel={'noreferrer'}> {value.address}</a>{' - '}{(vault.debtRatio/100).toLocaleString(undefined, {maximumFractionDigits:2})}{'% Allocated - Free Assets: '}{((vault.totalAssets - vault.totalDebt) / (10 ** vault.token.decimals)).toLocaleString(undefined, {maximumFractionDigits:2})}</div>}
			<div>{'loading strats...'}</div></div>);
	}

	function since(hours) {
		const now = new Date();
		now.setHours(now.getHours() - hours);
		return now;
	}

	const listItems = allS.map((strat) => (
		<div key={strat.address} className={css.strategy}>
			<div className={'flex items-center justify-between'}>
				<h2>{strat.name}</h2>
				<div className={'flex items-center gap-2'}>
					<button onClick={() => runSimZero(strat)}>{'Sim 0'}</button>
					<button className={'iconic no-text'} title={`Harvest ${strat.name}`}><TbTractor className={'text-2xl'} /></button>
					{!showHistoricHarvests[strat.address] && <button onClick={() => clickShowHistoricHarvests(strat.address)} className={'iconic no-text'} title={'Harvest history'}><TbHistory className={'text-2xl'} /></button>}
				</div>
			</div>
			<div className={'-mt-2'}>
				<a target={'_blank'} href={GetExplorerLink(provider.network.chainId, strat.address)} rel={'noreferrer'}>{strat.address}</a>
			</div>

			{strat.genlender && strat.genlender.map(lender => <div key={lender.add} className={'flex items-center gap-5'}>
				<div>{'Lender ' }<a target={'_blank'} rel={'noreferrer'} href={GetExplorerLink(provider.network.chainId, lender.add)}>{lender.name}</a></div>
				<div>{'Deposits ' + FormatNumer(lender.assets/(10 **vault.token.decimals))}</div>
				<div>{'APR '  + FormatPercent(lender.rate/(10 **18))}</div>
			</div>)}

			{zeros[strat.address] && <a target={'_blank'} rel={'noreferrer'} href={zeros[strat.address].tenderlyURL}>
				{(zeros[strat.address].success ? ' succeeded ' : 'failed ')}
			</a>}

			{(zeros[strat.address] && zeros[strat.address].result) && <ShowEvents events={zeros[strat.address].result.events} />}

			<div className={'flex items-center gap-5'}>
				<div>{'Last harvest '}
					<TimeAgo date={since(strat.lastTime)}></TimeAgo>
				</div>
				{strat.beforeDebt > bps && <>
					<div>{'Real ratio '}{(100 * strat.beforeDebt / strat.vaultAssets).toLocaleString(undefined, {maximumFractionDigits:2})}{'%'}</div>
					<div>{'Desired ratio '}{(strat.debtRatio / 100).toLocaleString(undefined, {maximumFractionDigits:2})}{'%'}</div>
				</>}
			</div>

			<div>{harvestedS.length > 0 ? (strat.succeded ? showApr(strat) : 'Failed Harvest ')  : ''} <a target={'_blank'} href={strat.tenderlyURL} rel={'noreferrer'}>{harvestedS.length > 0 && 'Tenderly Link'} </a></div>
			{historicHarvests[strat.address] && showGraphs && <div>
				<InfoChart name={'APR (capped at 200%)'} x={historicHarvests[strat.address].map(d => d['date_string']).reverse()} y={historicHarvests[strat.address].map(d => {
					let amount = d['rough_apr_pre_fee'] * 100;
					if (amount > 200){ amount = 200; }
					return amount;
				}).reverse()
				} importData={historicHarvests[strat.address]} /></div>}
			{showHistoricHarvests[strat.address] && <HistoricReports history={historicHarvests[strat.address]} />}
		</div>
	));

	return <div className={css.main}>
		<div className={'flex items-center justify-between'}>
			<div className={'flex items-center'}>
				<h1>{vault.name + ' ' + vault.version}</h1>
				<div className={'mx-8 flex items-center gap-2'}>
					<ReactSwitch onChange={() => setShowGraphs(current => !current)} checked={showGraphs} className={'react-switch'} onColor={'#0084c7'} checkedIcon={false} uncheckedIcon={false}>
					</ReactSwitch>
					<div onClick={() => setShowGraphs(current => !current)} className={'text-sm cursor-default'}>{'Charts'}</div>
				</div>
			</div>
			<div className={'flex items-center'}>
				<button onClick={onHarvestMultiple} className={'iconic'}><TbTractor className={'text-2xl'}></TbTractor>{'Harvest all strategies'}</button>
			</div>
		</div>
		<div className={'flex items-center gap-5'}>
			<a target={'_blank'} href={GetExplorerLink(provider.network.chainId, value.address)} rel={'noreferrer'}>{value.address}</a>
			<div>{'Total Assets '}{(vault.totalAssets / (10 ** vault.token.decimals)).toLocaleString(undefined, {maximumFractionDigits:2})}</div>
			<div>{'Free Assets '}{((vault.totalAssets - vault.totalDebt) / (10 ** vault.token.decimals)).toLocaleString(undefined, {maximumFractionDigits:2})}</div>
			<div>{(vault.debtRatio/100).toLocaleString(undefined, {maximumFractionDigits:2})}{'% Allocated'}</div>
		</div>

		{harvestedS.length > 0 && <div> {showTotalApr()}</div>}
		<div className={css.strategies}>
			{listItems}
		</div>

		<div className={'my-8'}>
			<div>{showRatio && <RatioAdjust strats={allS} />}</div>
			<div><button onClick={() => toggleRatios(!showRatio)}>{' Adjust Ratios?'}</button></div>
		</div>
	</div>; 
}



export default SingleVaultPage;