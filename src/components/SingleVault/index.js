import React, {useState, useEffect, useCallback} from 'react';
import useLocalStorage from 'use-local-storage';
import TimeAgo from 'react-timeago';
import {TbHistory, TbTractor} from 'react-icons/tb';
import {AllStrats, AllVaults} from  '../../ethereum/EthHelpers';
import useRPCProvider from '../../context/useRpcProvider';
import RatioAdjust from '../../pages/RatioAdjusters';
import {formatNumber, formatPercent, getAddressExplorer, truncateAddress} from '../../utils/utils';
import HarvestHistory from './HarvestHistory';
import {setupTenderly, TenderlySim} from '../../ethereum/TenderlySim';
import axios from '../../axios';
import InfoChart from './InfoChart';
import {A, Bone, Button, Switch} from '../controls';
import useScrollOverpass from '../../context/useScrollOverpass';
import CopyButton from './CopyButton';
import {BiggerThanSmallScreen, SmallScreen} from '../../utils/breakpoints';

function SingleVaultPage({value}){
	const {overpassClassName} = useScrollOverpass();
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

		return <>
			<SmallScreen>
				<div className={'grid grid-cols-3'}>
					<div>{'Vault APR'}</div>
					<div>{'Before Fees'}</div>
					<div>{'After Fees'}</div>
					<div></div>
					<div className={'font-mono'}>{formatPercent(apr)}</div>
					<div className={'font-mono'}>{formatPercent(after)}</div>
				</div>
			</SmallScreen>
			<BiggerThanSmallScreen>
				<div className={'flex items-center gap-5'}>
					<div>{'Vault APR'}</div>
					<div>{`Before Fees ${formatPercent(apr)}`}</div>
					<div>{`After Fees ${formatPercent(after)}`}</div>
				</div>
			</BiggerThanSmallScreen>
		</>;
	}

	function StrategyApr(strategy) {
		if(!strategy.succeded) return;
		const apr = getStrategyApr(strategy);
		return <>
			<div className={'grid grid-cols-4'}>
				<div className={'font-bold'}>{'Harvest'}</div>
				<div className={'font-bold'}>{'Strat Apr'}</div>
				<div className={'font-bold text-right'}>{'Before fees'}</div>
				<div className={'font-bold text-right'}>{'After fees'}</div>
				<A target={'_blank'} href={strategy.tenderlyUrl} rel={'noreferrer'}>{'Success'}</A>
				<div></div>
				<div className={'text-right font-mono'}>{formatPercent(apr.beforeFee)}</div>
				<div className={'text-right font-mono'}>{formatPercent(apr.afterFee)}</div>
			</div>
		</>;
	}

	function since(hours) {
		const now = new Date();
		now.setHours(now.getHours() - hours);
		return now;
	}

	function toggleHarvestHistory(strategy){
		setShowHarvestHistory(
			currentValues => {
				const result = {...currentValues};
				result[strategy.address] = (result[strategy.address] === undefined)
					? true
					: !result[strategy.address];
				return result;
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
					currentValues[strategy.address].tenderlyUrl = `https://dashboard.tenderly.co/yearn/yearn-web/fork/${tenderly.connection.url.substring(29)}/simulation/${x[1].tenderlyId}`;
					return currentValues;
				});
			});
		});
	}

	function Chip({className, children}) {
		return <div className={`
			px-2 py-1 flex items-center
			text-xs text-secondary-50 capitalize 
			rounded-lg drop-shadow-sm
			${className}`}>
			{children}
		</div>;
	}

	function HarvestAll({buttonClassName}) {
		return <div className={'flex flex-col items-center'}>
			<Button icon={TbTractor} 
				label={'Harvest all strategies'}
				onClick={onHarvestAll} 
				ping={harvestingAll}
				disabled={harvestingAll}
				className={buttonClassName}
				iconClassName={'text-2xl'} />
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
		</div>;
	}

	const Strategies = strategies.map((strategy) => {
		return <div key={strategy.address} className={`
			-mx-4 pt-4 pb-6 px-4 flex flex-col gap-2
			rounded border-b border-dashed border-primary-900/40
			transition duration-200`}>
			<div className={'flex items-center justify-between'}>
				<div className={'flex items-center gap-2'}>
					<A target={'_blank'} href={getAddressExplorer(provider.network.chainId, strategy.address)} rel={'noreferrer'}>{truncateAddress(strategy.address)}</A>
					<CopyButton clip={strategy.address}></CopyButton>
				</div>
				<div className={'flex items-center gap-2'}>
					<Button label={'Sim 0'} onClick={() => runSimZero(strategy)} />
					<Button icon={TbTractor} 
						title={`Harvest ${strategy.name}`} 
						onClick={async () => await onHarvestStrategy(strategy)} 
						ping={strategy.harvesting}
						disabled={strategy.harvesting} 
						iconClassName={'text-2xl'} />
					<Button icon={TbHistory} 
						title={'Harvest history'} 
						onClick={() => toggleHarvestHistory(strategy)} 
						iconClassName={'text-2xl'} />
				</div>
			</div>

			<h2 className={'font-bold text-xl break-words'}>{strategy.name}</h2>

			<div>
				{strategy.genlender && 
					<div className={'grid grid-cols-4 font-bold'}>
						<div className={'col-span-2'}>{'Lender'}</div>
						<div className={'text-right'}>{'Deposits'}</div>
						<div className={'text-right'}>{'APR'}</div>
					</div>}
				{strategy.genlender && strategy.genlender.map(lender => 
					<div key={lender.add} className={'grid grid-cols-4'}>
						<div className={'col-span-2'}><A target={'_blank'} rel={'noreferrer'} href={getAddressExplorer(provider.network.chainId, lender.add)}>{lender.name}</A></div>
						<div className={'text-right font-mono'}>{formatNumber(lender.assets/(10 **vault.token.decimals))}</div>
						<div className={'text-right font-mono'}>{formatPercent(lender.rate/(10 **18))}</div>
					</div>)}
			</div>

			<div>
				<div className={'grid grid-cols-4'}>
					<div className={'col-span-2 font-bold'}>{'Last harvest'}</div>
					<div className={'text-right font-bold'}>{'Real ratio'}</div>
					<div className={'text-right font-bold'}>{'Desired'}</div>
					<div className={'col-span-2'}><TimeAgo date={since(strategy.lastTime)}></TimeAgo></div>
					<div className={'text-right font-mono'}>{formatPercent(strategy.beforeDebt / strategy.vaultAssets)}</div>
					<div className={'text-right font-mono'}>{formatPercent(strategy.debtRatio / 10_000)}</div>
				</div>
			</div>

			<div className={'max-w-prose'}>
				{strategy.harvesting ? <Bone></Bone> : strategy.succeded === undefined ? <Bone invisible={true}></Bone> 
					: strategy.succeded
						? StrategyApr(strategy) 
						: <A target={'_blank'} href={strategy.tenderlyUrl} rel={'noreferrer'}>{'Harvest failed'}</A>}
			</div>

			{zeros[strategy.address] && 
				<div className={'w-full overflow-x-auto'}>
					<table>
						<thead>
							<tr>
								<th className={'text-left whitespace-nowrap'}>{'Harvest (0 Debt)'}</th>
								<th className={'pl-3 text-right'}>{'Profit'}</th>
								<th className={'pl-3 text-right'}>{'Loss'}</th>
								<th className={'pl-3 text-right whitespace-nowrap'}>{'Debt payment'}</th>
								<th className={'pl-3 text-right whitespace-nowrap'}>{'Debt outstanding'}</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td className={'text-left'}>
									<A target={'_blank'} rel={'noreferrer'} href={zeros[strategy.address].tenderlyUrl}>
										{(zeros[strategy.address].success ? ' Success ' : 'failed ')}
									</A>
								</td>
								<td className={'text-right font-mono'}>{formatTokens(zeros[strategy.address].result?.events[2].args['profit'])}</td>
								<td className={'text-right font-mono'}>{formatTokens(zeros[strategy.address].result?.events[2].args['loss'])}</td>
								<td className={'text-right font-mono'}>{formatTokens(zeros[strategy.address].result?.events[2].args['debtPayment'])}</td>
								<td className={'text-right font-mono'}>{formatTokens(zeros[strategy.address].result?.events[2].args['debtOutstanding'])}</td>
							</tr>
						</tbody>
					</table>
				</div>}

			{strategy.harvestHistory && showGraphs && <div>
				<InfoChart name={'APR (capped at 200 %)'} x={strategy.harvestHistory.map(d => d['date_string']).reverse()} y={strategy.harvestHistory.map(d => {
					let amount = d['rough_apr_pre_fee'] * 100;
					if (amount > 200){ amount = 200; }
					return amount;
				}).reverse()
				} importData={strategy.harvestHistory} /></div>}
			{showHarvestHistory[strategy.address] && <HarvestHistory history={strategy.harvestHistory} />}
		</div>;
	});

	if(strategies.length === 0) {
		return <div>{'loading...'}</div>;
	}

	function formatTokens(tokens) {
		return tokens / 10 ** vault.token.decimals;
	}

	return <div className={'px-4 sm:px-8 '}>
		<div className={`
			sticky top-0 z-10 -mx-4 sm:-mx-8 sm:px-8 sm:py-2 
			flex flex-col sm:flex-row sm:items-center sm:justify-between 
			${overpassClassName}`}>
			<SmallScreen>
				<div className={'w-full py-5 pr-4 flex items-center justify-between gap-4'}>
					<div className={'w-1/5'}></div>
					<Chip className={'bg-primary-400 dark:bg-primary-900'}>{vault.version}</Chip>
					<Chip className={`bg-${provider.network.name}`}>{provider.network.name}</Chip>
					<A target={'_blank'} href={getAddressExplorer(provider.network.chainId, value.address)} rel={'noreferrer'}>
						{truncateAddress(value.address)}
					</A>
					<CopyButton clip={value.address}></CopyButton>
				</div>
				<div className={'px-4 pb-2 flex flex-col gap-2'}>
					<h1 className={'font-bold text-5xl'}>{vault.name}</h1>
					<div className={'grid grid-cols-3 gap-x-6'}>
						<div>{'Total Assets'}</div>
						<div>{'Free Assets '}</div>
						<div>{'Allocated'}</div>
						<div className={'text-sm font-mono'}>{formatTokens(vault.totalAssets)}</div>
						<div className={'text-sm font-mono'}>{(formatTokens(vault.totalAssets - vault.totalDebt)).toLocaleString(undefined, {maximumFractionDigits:2})}</div>
						<div className={'text-sm font-mono'}>{formatPercent(vault.debtRatio/10_000, 0)}</div>
					</div>
					{harvestingAll 
						? <div><Bone /><Bone /></div> 
						: anyHarvests ? VaultApr() : <div><Bone invisible={true} /><Bone invisible={true} /></div>}
					<HarvestAll buttonClassName={'w-full'} />
				</div>
			</SmallScreen>
			<BiggerThanSmallScreen>
				<div>
					<div className={'flex items-center'}>
						<h1 className={'font-bold text-5xl'}>{vault.name}</h1>
						<div className={'mx-8 flex items-center gap-2'}>
							<Switch onChange={() => setShowGraphs(current => !current)} checked={showGraphs} />
							<div onClick={() => setShowGraphs(current => !current)} className={'text-sm cursor-default'}>{'Charts'}</div>
						</div>
					</div>
					<div className={'my-1 flex gap-2'}>
						<Chip className={'bg-primary-400 dark:bg-primary-900'}>{vault.version}</Chip>
						<Chip className={`bg-${provider.network.name}`}>{provider.network.name}</Chip>
						<A target={'_blank'} href={getAddressExplorer(provider.network.chainId, value.address)} rel={'noreferrer'}>{value.address}</A>
						<CopyButton clip={value.address}></CopyButton>
					</div>
					<div className={'flex items-center gap-5'}>
						<div>{'Total Assets '}{formatNumber(vault.totalAssets / (10 ** vault.token.decimals))}</div>
						<div>{'Free Assets '}{((vault.totalAssets - vault.totalDebt) / (10 ** vault.token.decimals)).toLocaleString(undefined, {maximumFractionDigits:2})}</div>
						<div>{`${formatPercent(vault.debtRatio/10_000, 0)} Allocated`}</div>
					</div>
					{harvestingAll ? <Bone></Bone> : anyHarvests ? VaultApr() : <Bone invisible={true}></Bone>}
				</div>
				<HarvestAll />
			</BiggerThanSmallScreen>
		</div>
	
		<div className={'mt-4'}>{Strategies}</div>

		<div className={'my-8'}>
			<div>{showRatio && <RatioAdjust strats={strategies} />}</div>
			<div><Button label={'Adjust ratios?'} onClick={() => toggleRatios(!showRatio)} /></div>
		</div>
	</div>; 
}

export default SingleVaultPage;