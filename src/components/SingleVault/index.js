import React, {useState, useEffect, useCallback} from 'react';
import useLocalStorage from 'use-local-storage';
import TimeAgo from 'react-timeago';
import {TbHistory, TbTractor} from 'react-icons/tb';
import {AllStrats, AllVaults} from  '../../ethereum/EthHelpers';
import useRPCProvider from '../../context/useRpcProvider';
import RatioAdjust from '../../pages/RatioAdjusters';
import {formatNumber, formatPercent, getAddressExplorer} from '../../utils/utils';
import HarvestHistory from './HarvestHistory';
import {setupTenderly, TenderlySim} from '../../ethereum/TenderlySim';
import ShowEvents from '../../components/ShowEvents';
import axios from '../../axios';
import InfoChart from '../../components/Vaults/InfoChart';
import css from './index.module.css';
import Switch from '../Switch';
import Bone from '../Bone';
import useScrollOverpass from '../Header/useScrollOverpass';
import CopyButton from './CopyButton';

function SingleVaultPage({value}){
	const {overpassClass} = useScrollOverpass();
	const {providers} = useRPCProvider();
	const [strategies, setStrategies] = useState([]);
	const [showHarvestHistory, setShowHarvestHistory] = useState({});
	const [harvestingAll, setHarvestingAll] = useState(false);
	const [vault, setVault] = useState({});
	const [showRatio, toggleRatios] = useState(false);
	const [zeros, setStateZeros] = useState({});
	const [showGraphs, setShowGraphs] = useLocalStorage('SingleVault.settings.showGraphs', false);
	const provider = providers.find(p => p.network.chainId == value.chain);
	const anyHarvests = strategies.some(s => s.succeded);

	useEffect(() => {
		if(value.address && provider){
			AllVaults(value, provider).then(freshVault => {
				setVault(freshVault);
			});
		}
	}, [value, provider]);

	useEffect(() => {
		if(vault.address && provider){
			AllStrats(vault, provider).then(freshStrategies => {
				(async () => {
					for(const strategy of freshStrategies) {
						strategy.harvesting = false;
						const response = await axios.post('api/getVaults/AllStrategyReports', strategy);
						strategy.harvestHistory = response.data;
					}
					setStrategies([...freshStrategies]);
				})();
			});
		}
	}, [vault, provider]);

	const getStrategyApr = useCallback((strategy) => {
		if(!strategy.succeded) {
			return {beforeFee: 0, afterFee: 0};
		}

		if(strategy.beforeDebt.eq(0)) {
			if(strategy.estimatedTotalAssets.gt(0)) {
				return {beforeFee: Infinity, afterFee: Infinity};
			} else {
				return {beforeFee: 0, afterFee: 0};
			}
		}

		const profit = strategy.paramsAfterHarvest.totalGain - strategy.beforeGain;
		const loss = strategy.paramsAfterHarvest.totalLoss - strategy.beforeLoss;

		const pnlToDebt = (loss > profit)
			? -1 * loss / strategy.beforeDebt
			: profit / strategy.beforeDebt;

		const annualizedPnlToDebt = pnlToDebt * 8760 / strategy.lastTime;

		const performanceFee = vault.performanceFee / 10_000;
		const managementFee = vault.managementFee / 10_000;
		const delegatedToDebt = strategy.delegatedAssets / strategy.beforeDebt;

		let annualizedPnlToDebtAfterFees = 
			annualizedPnlToDebt * (1 - performanceFee) 
			- managementFee * (1 - delegatedToDebt);

		annualizedPnlToDebtAfterFees = Math.max(annualizedPnlToDebtAfterFees, 0);

		return {beforeFee: annualizedPnlToDebt, afterFee: annualizedPnlToDebtAfterFees};
	}, [vault]);

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
			setStrategies(current => {
				current.find(s => s.address === strategy.address).harvesting = true;
				return [...current];
			});

			Object.assign(strategy, await harvestStrategy(tenderly, strategy));

			setStrategies(current => {
				current.find(s => s.address === strategy.address).harvesting = false;
				return [...current];
			});
		}
		setHarvestingAll(false);
	}, [strategies, setStrategies, provider, harvestStrategy]);

	const	onHarvestStrategy = useCallback(async (strategy) => {
		setStrategies(current => {
			current.find(s => s.address === strategy.address).harvesting = true;
			return [...current];
		});

		const tenderly = await setupTenderly(provider.network.chainId);
		Object.assign(strategy, await harvestStrategy(tenderly, strategy));

		setStrategies(current => {
			current.find(s => s.address === strategy.address).harvesting = false;
			return [...current];
		});
	}, [setStrategies, provider, harvestStrategy]);

	function VaultApr() {
		let total_weighted_apr = 0;
		let total_user_apr = 0;

		for(const strategy of strategies){
			const strategyApr = getStrategyApr(strategy);
			total_weighted_apr += strategyApr.beforeFee * strategy.beforeDebt;
			total_user_apr += strategyApr.afterFee * strategy.beforeDebt;
		}

		let apr = total_weighted_apr/vault.totalAssets;
		let after = total_user_apr/vault.totalAssets;
		return <div className={'flex items-center gap-5'}>
			<div>{'Total Vault APR'}</div>
			<div>{`Before Fees ${formatPercent(apr)}`}</div>
			<div>{`After Fees ${formatPercent(after)}`}</div>
		</div>;
	}

	function StrategyApr(strategy) {
		if(!strategy.succeded) return;
		const apr = getStrategyApr(strategy);
		return <div className={'flex items-center gap-5'}>
			<a target={'_blank'} href={strategy.tenderlyUrl} rel={'noreferrer'}>{'Harvest simulation'}</a>
			<div>{'APR'}</div>
			<div>{`Before fees ${formatPercent(apr.beforeFee)}`}</div>
			<div>{`After fees ${formatPercent(apr.afterFee)}`}</div>
		</div>;
	}

	function since(hours) {
		const now = new Date();
		now.setHours(now.getHours() - hours);
		return now;
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
			});
		});
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
			<div className={'-mt-2 flex items-center gap-2'}>
				<a target={'_blank'} href={getAddressExplorer(provider.network.chainId, strategy.address)} rel={'noreferrer'}>{strategy.address}</a>
				<CopyButton clip={strategy.address}></CopyButton>
			</div>

			{strategy.genlender && strategy.genlender.map(lender => <div key={lender.add} className={'flex items-center gap-5'}>
				<div>{'Lender '}<a target={'_blank'} rel={'noreferrer'} href={getAddressExplorer(provider.network.chainId, lender.add)}>{lender.name}</a></div>
				<div>{'Deposits ' + formatNumber(lender.assets/(10 **vault.token.decimals))}</div>
				<div>{'APR ' + formatPercent(lender.rate/(10 **18))}</div>
			</div>)}

			{zeros[strategy.address] && <a target={'_blank'} rel={'noreferrer'} href={zeros[strategy.address].tenderlyUrl}>
				{(zeros[strategy.address].success ? ' succeeded ' : 'failed ')}
			</a>}

			{(zeros[strategy.address] && zeros[strategy.address].result) && <ShowEvents events={zeros[strategy.address].result.events} />}

			<div className={'flex items-center gap-5'}>
				<div>{'Last harvest '}
					<TimeAgo date={since(strategy.lastTime)}></TimeAgo>
				</div>
				{strategy.beforeDebt > 1 && <>
					<div>{`Real ratio ${formatPercent(strategy.beforeDebt / strategy.vaultAssets)}`}</div>
					<div>{`Desired ratio ${formatPercent(strategy.debtRatio / 10_000)}`}</div>
				</>}
			</div>

			<div className={'max-w-prose'}>
				{strategy.harvesting ? <Bone></Bone> : strategy.succeded === undefined ? <Bone invisible={true}></Bone> 
					: strategy.succeded
						? StrategyApr(strategy) 
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
		<div className={`${css.header} ${overpassClass}`}>
			<div>
				<div className={'flex items-center'}>
					<h1>{vault.name}</h1>
					<div className={'mx-8 flex items-center gap-2'}>
						<Switch onChange={() => setShowGraphs(current => !current)} checked={showGraphs} />
						<div onClick={() => setShowGraphs(current => !current)} className={'text-sm cursor-default'}>{'Charts'}</div>
					</div>
				</div>
				<div className={'my-1 flex gap-2'}>
					<div className={`${css.chip} bg-version`}>{vault.version}</div>
					<div className={`${css.chip} bg-${provider.network.name}`}>
						{provider.network.name}
					</div>
					<a target={'_blank'} href={getAddressExplorer(provider.network.chainId, value.address)} rel={'noreferrer'}>{value.address}</a>
					<CopyButton clip={value.address}></CopyButton>
				</div>
				<div className={'flex items-center gap-5'}>
					<div>{'Total Assets '}{formatNumber(vault.totalAssets / (10 ** vault.token.decimals))}</div>
					<div>{'Free Assets '}{((vault.totalAssets - vault.totalDebt) / (10 ** vault.token.decimals)).toLocaleString(undefined, {maximumFractionDigits:2})}</div>
					<div>{`${formatPercent(vault.debtRatio/10_000, 0)} Allocated`}</div>
				</div>
				{harvestingAll ? <Bone></Bone> : anyHarvests ? VaultApr() : <Bone invisible={true}></Bone>}
			</div>

			<div className={'flex flex-col items-center'}>
				<button disabled={harvestingAll} onClick={onHarvestAll} className={`iconic ${harvestingAll ? 'border-primary-400 animate-pulse' : ''}`}>
					<TbTractor className={'text-2xl'}></TbTractor>{'Harvest all strategies'}
				</button>
				<div className={'w-full mt-2 px-1 flex items-center justify-center gap-1'}>
					{strategies && strategies.map(strategy => {
						if(strategy.succeded === undefined)
							return <div key={strategy.address} className={'grow h-1 bg-secondary-200 dark:bg-secondary-800 rounded'}></div>;
						else if(strategy.succeded) {
							return <div key={strategy.address} className={'grow h-1 bg-primary-300 dark:bg-primary-600 rounded'}></div>;
						} else {
							return <div key={strategy.address} className={'grow h-1 bg-error-400 rounded'}></div>;							
						}
					})}
				</div>
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