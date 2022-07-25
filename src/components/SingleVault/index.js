import React, {useState, useEffect, useCallback} from 'react';
import useLocalStorage from 'use-local-storage';
import TimeAgo from 'react-timeago';
import {TbHistory, TbTractor} from 'react-icons/tb';
import {AllStrats, AllVaults} from  '../../ethereum/EthHelpers';
import useRPCProvider from '../../context/useRpcProvider';
import RatioAdjust from '../../pages/RatioAdjusters';
import {FormatNumer, FormatPercent, GetExplorerLink} from '../../utils/utils';
import HarvestHistory from './HarvestHistory';
import {setupTenderly, TenderlySim} from '../../ethereum/TenderlySim';
import ShowEvents from '../../components/ShowEvents';
import axios from '../../axios';
import InfoChart from '../../components/Vaults/InfoChart';
import css from './index.module.css';
import ReactSwitch from 'react-switch';
import Bone from '../Bone';

const bps = 0.0001;

function SingleVaultPage({value}){
	const {fantomProvider, defaultProvider} = useRPCProvider();
	const [strategies, setStrategies] = useState([]);
	const [showHarvestHistory, setShowHarvestHistory] = useState({});
	const [harvestingAll, setHarvestingAll] = useState(false);
	const [vault, setVault] = useState({});
	const [nonce, setNonce] = useState(0);
	const [showRatio, toggleRatios] = useState(false);
	const [zeros, setStateZeros] = useState({});
	const [showGraphs, setShowGraphs] = useLocalStorage('SingleVault.settings.showGraphs', false);
	const provider = value.chain == 250 ? fantomProvider : defaultProvider;
	const anyHarvests = strategies.some(s => s.succeded);

	useEffect(() => {
		if(value.address && provider){
			AllVaults(value, provider).then(x => {
				setVault(x);
			});
		}
	}, [value, provider]);

	useEffect(() => {
		if(vault.address && provider){
			AllStrats(vault, provider).then(freshStrategies => {
				freshStrategies.sort((a, b) => a.lastTime - b.lastTime);
				freshStrategies.forEach(strategy => {
					strategy.harvesting = false;
					axios.post('api/getVaults/AllStrategyReports', strategy).then((response) => {
						strategy.harvestHistory = response.data;
						setNonce(nonce+Math.random(100));
					});
				});
				setStrategies(freshStrategies || []);
			});
		}
	}, [vault, provider]);

	const harvestStrategy = useCallback(async (tenderly, strategy) => {
		strategy.succeded = false;
		const vaultSimulator = vault.contract.connect(tenderly);
		const governorSig = tenderly.getSigner(strategy.governance);
		const strategySimulator = strategy.contract.connect(governorSig);

		try{
			await((
				await strategySimulator.harvest({gasLimit: 8_000_000, gasPrice:0})
			).wait());
			strategy.paramsAfterHarvest = await vaultSimulator.strategies(strategy.address);
			strategy.succeded = true;
		}catch(e){
			console.warn('harvest failed', strategy);
		}

		strategy.tenderlyId = await tenderly.send('evm_getLatest', []);
		strategy.tenderlyUrl = `https://dashboard.tenderly.co/yearn/yearn-web/fork/${tenderly.connection.url.substring(29)}/simulation/${strategy.tenderlyId}`;
		return strategy;
	}, [vault]);

	const	onHarvestAll = useCallback(async () => {
		setHarvestingAll(true);
		const tenderly = await setupTenderly(provider.network.chainId);
		for(const strategy of strategies) {
			strategy.harvesting = true;
			setStrategies([...strategies]);
			Object.assign(strategy, await harvestStrategy(tenderly, strategy));
			strategy.harvesting = false;
			setStrategies([...strategies]);
		}
		setHarvestingAll(false);
	}, [strategies, setStrategies, provider, harvestStrategy]);

	const	onHarvestStrategy = useCallback(async (strategy) => {
		const tenderly = await setupTenderly(provider.network.chainId);
		strategy.harvesting = true;
		setStrategies([...strategies]);
		Object.assign(strategy, await harvestStrategy(tenderly, strategy));
		strategy.harvesting = false;
		setStrategies([...strategies]);
	}, [strategies, setStrategies, provider, harvestStrategy]);

	function runSimZero(strategy){
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
		s['asd']['strategy'] = strategy.address;
		s['asd']['debtRatio'] = '0';
		extended.inputs = s['asd'];

		blocks.push(extended);

		//harvest

		let block1 = strategy;
		extended1.block = block1;
		extended1.contract = vault.contract;
	
		extended1.function = strategy.contract.interface.fragments.find(x => x.name === 'harvest');

		blocks.push(extended1);

		setupTenderly(provider.network.chainId).then(tenderly =>{
			TenderlySim(blocks, tenderly).then(x =>{
				console.log(x);
				setStateZeros(currentValues => {
					currentValues[strategy.address] = x[1];
					return currentValues;
				});
				setNonce(nonce+Math.random(100));
			});
		});
	}

	function toggleHarvestHistory(strategy){
		setShowHarvestHistory(
			currentValues => {
				currentValues[strategy.address] = (currentValues[strategy.address] === undefined)
					? true
					: !currentValues[strategy.address];
				return {...currentValues};
			});
	}

	function getApr(strategy){
		if(!strategy.succeded){
			return {beforeFee: 0, afterFee: 0};
		}

		const profit = strategy.paramsAfterHarvest.totalGain - strategy.beforeGain;
		const loss = strategy.paramsAfterHarvest.totalLoss - strategy.beforeLoss;
		let percent = 0;
		if (strategy.beforeDebt > 0) {
			if (loss > profit){
				percent = -1 * loss / strategy.beforeDebt; 
			} else {
				percent = profit / strategy.beforeDebt;
			}
		}
		const over_year = (100*percent * 8760 / strategy.lastTime);

		const delegated_percent = strategy.delegatedAssets/strategy.beforeDebt;
		let user_apr = (over_year*0.8) - (2*(1-delegated_percent));
		user_apr = user_apr > 0 ? user_apr : 0;
		return {beforeFee: over_year, afterFee: user_apr};    
	}

	function TotalApr() {
		let total_weighted_apr = 0;
		let total_user_apr = 0;

		for(const strategy of strategies){
			let fee= getApr(strategy);
			let beforeFee = fee.beforeFee;
			let afterFee = fee.afterFee;
			total_weighted_apr += beforeFee*strategy.beforeDebt;
			total_user_apr += afterFee*strategy.beforeDebt;
		}

		let apr = total_weighted_apr/vault.totalAssets;
		let after = total_user_apr/vault.totalAssets;
		return <div className={'flex items-center gap-5'}>
			<div>{'Total Vault APR'}</div>
			<div>{`Before Fees ${apr.toLocaleString(undefined, {maximumFractionDigits:2})}%`}</div>
			<div>{`After Fees ${after.toLocaleString(undefined, {maximumFractionDigits:2})}%`}</div>
		</div>;
	}

	function Apr(strategy) {
		if(!strategy.succeded) return;
		const fee = getApr(strategy);
		return <div className={'flex items-center gap-5'}>
			<a target={'_blank'} href={strategy.tenderlyUrl} rel={'noreferrer'}>{'Harvest simulation'}</a>
			<div>{`before-fee APR ${FormatPercent(fee.beforeFee / 100)}`}</div>
			<div>{`after-fee APR ${FormatPercent(fee.afterFee / 100)}`}</div>
		</div>;
	}

	function since(hours) {
		const now = new Date();
		now.setHours(now.getHours() - hours);
		return now;
	}

	const Strategies = strategies.map((strategy) => (
		<div key={strategy.address} className={css.strategy}>
			<div className={'flex items-center justify-between'}>
				<h2>{strategy.name}</h2>
				<div className={'flex items-center gap-2'}>
					<button onClick={() => runSimZero(strategy)}>{'Sim 0'}</button>
					<button onClick={async () => await onHarvestStrategy(strategy)} disabled={strategy.harvesting} className={`iconic no-text ${strategy.harvesting ? 'border-primary-400 animate-pulse' : ''}`} title={`Harvest ${strategy.name}`}><TbTractor className={'text-2xl'} /></button>
					<button onClick={() => toggleHarvestHistory(strategy)} className={'iconic no-text'} title={'Harvest history'}><TbHistory className={'text-2xl'} /></button>
				</div>
			</div>
			<div className={'-mt-2'}>
				<a target={'_blank'} href={GetExplorerLink(provider.network.chainId, strategy.address)} rel={'noreferrer'}>{strategy.address}</a>
			</div>

			{strategy.genlender && strategy.genlender.map(lender => <div key={lender.add} className={'flex items-center gap-5'}>
				<div>{'Lender '}<a target={'_blank'} rel={'noreferrer'} href={GetExplorerLink(provider.network.chainId, lender.add)}>{lender.name}</a></div>
				<div>{'Deposits ' + FormatNumer(lender.assets/(10 **vault.token.decimals))}</div>
				<div>{'APR ' + FormatPercent(lender.rate/(10 **18))}</div>
			</div>)}

			{zeros[strategy.address] && <a target={'_blank'} rel={'noreferrer'} href={zeros[strategy.address].tenderlyUrl}>
				{(zeros[strategy.address].success ? ' succeeded ' : 'failed ')}
			</a>}

			{(zeros[strategy.address] && zeros[strategy.address].result) && <ShowEvents events={zeros[strategy.address].result.events} />}

			<div className={'flex items-center gap-5'}>
				<div>{'Last harvest '}
					<TimeAgo date={since(strategy.lastTime)}></TimeAgo>
				</div>
				{strategy.beforeDebt > bps && <>
					<div>{`Real ratio ${FormatPercent(strategy.beforeDebt / strategy.vaultAssets)}`}</div>
					<div>{`Desired ratio ${FormatPercent(strategy.debtRatio / 10_000)}`}</div>
				</>}
			</div>

			<div className={'max-w-prose'}>
				{strategy.harvesting ? <Bone></Bone> : strategy.succeded === undefined ? <Bone invisible={true}></Bone> 
					: strategy.succeded
						? Apr(strategy) 
						: <a target={'_blank'} href={strategy.tenderlyUrl} rel={'noreferrer'}>{'Harvest failed'}</a>}
			</div>

			{strategy.harvestHistory && showGraphs && <div>
				<InfoChart name={'APR (capped at 200 %)'} x={strategy.harvestHistory.map(d => d['date_string']).reverse()} y={strategy.harvestHistory.map(d => {
					let amount = d['rough_apr_pre_fee'] * 100;
					if (amount > 200){ amount = 200; }
					return amount;
				}).reverse()
				} importData={strategy.harvestHistory} /></div>}
			{showHarvestHistory[strategy.address] && <HarvestHistory history={strategy.harvestHistory} />}
		</div>
	));

	if(strategies.length === 0) {
		return <div>{'loading...'}</div>;
	}

	return <div className={css.main}>
		<div className={'flex items-center justify-between'}>
			<div>
				<div className={'flex items-center'}>
					<h1>{`${vault.name} ${vault.version}`}</h1>
					<div className={'mx-8 flex items-center gap-2'}>
						<ReactSwitch onChange={() => setShowGraphs(current => !current)} checked={showGraphs} className={'react-switch'} onColor={'#0084c7'} checkedIcon={false} uncheckedIcon={false}>
						</ReactSwitch>
						<div onClick={() => setShowGraphs(current => !current)} className={'text-sm cursor-default'}>{'Charts'}</div>
					</div>
				</div>
				<a target={'_blank'} href={GetExplorerLink(provider.network.chainId, value.address)} rel={'noreferrer'}>{value.address}</a>
				<div className={'flex items-center gap-5'}>
					<div>{'Total Assets '}{FormatNumer(vault.totalAssets / (10 ** vault.token.decimals))}</div>
					<div>{'Free Assets '}{((vault.totalAssets - vault.totalDebt) / (10 ** vault.token.decimals)).toLocaleString(undefined, {maximumFractionDigits:2})}</div>
					<div>{`${FormatPercent(vault.debtRatio/10_000, 0)} Allocated`}</div>
				</div>
				{harvestingAll ? <Bone></Bone> : anyHarvests ? TotalApr() : <Bone invisible={true}></Bone>}
			</div>

			<div className={'flex items-center'}>
				<button disabled={harvestingAll} onClick={onHarvestAll} className={`iconic ${harvestingAll ? 'border-primary-400 animate-pulse' : ''}`}>
					<TbTractor className={'text-2xl'}></TbTractor>{'Harvest all strategies'}
				</button>
			</div>
		</div>

		<div className={css.strategies}>
			{Strategies}
		</div>

		<div className={'my-8'}>
			<div>{showRatio && <RatioAdjust strats={strategies} />}</div>
			<div><button onClick={() => toggleRatios(!showRatio)}>{' Adjust Ratios?'}</button></div>
		</div>
	</div>; 
}

export default SingleVaultPage;