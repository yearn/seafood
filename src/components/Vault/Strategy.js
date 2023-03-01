import React, {useMemo, useState} from 'react';
import {TbTractor} from 'react-icons/tb';
import {MdHistory} from 'react-icons/md';
import TimeAgo from 'react-timeago';
import {formatNumber, formatPercent, formatTokens, getAddressExplorer, truncateAddress} from '../../utils/utils';
import {A, Button, Input, LinkButton} from '../controls';
import InfoChart from './InfoChart';
import CopyButton from './CopyButton';
import {useVault} from './VaultProvider';
import HarvestHistory from './HarvestHistory';
import {useSimulator} from './SimulatorProvider';
import {useLocation} from 'react-router-dom';
import {translateRiskScore, translateTvlImpact} from '../Risk/Score';
import {scoreToBgColor} from '../Risk/colors';

function Field({value, simulated, delta, className, children}) {
	return <div className={`
		font-mono text-right
		${simulated ? value >= 0 
		? 'text-primary-600 dark:text-primary-400' 
		: 'text-error-600 dark:text-error-400' : ''}
		${className}`}>
		{delta && value > 0 ? '+' : '' }{children}
	</div>;	
}

function Tokens({value, token, simulated, delta, className}) {
	return <Field value={value} simulated={simulated} delta={delta} className={className}>
		{formatTokens(value, token.decimals, 2, true)}
	</Field>;
}

function Percentage({value, simulated, delta, className}) {
	return <Field value={value} simulated={simulated} delta={delta} className={className}>
		{formatPercent(value)}
	</Field>;
}

export default function Strategy({strategy}) {
	const location = useLocation();
	const {vault, provider, token, reports, showHarvestChart} = useVault();
	const simulator = useSimulator();
	const strategyHarvestHistory = reports.filter(r => r.strategy_address === strategy.address);
	const [showHarvestHistory, setShowHarvestHistory] = useState(false);

	const lastStrategy = useMemo(() => {
		const last = (vault?.withdrawalQueue || [])?.at(-1)?.address || '';
		return strategy.address === last;
	}, [strategy, vault]);

	function latestHarvest(strategy) {
		return new Date(strategy.lastReport * 1000);
	}

	return <div className={`
		px-4 pt-2 sm:pt-0 sm:pr-12 sm:pl-8 flex flex-col gap-2`}>

		<div className={'flex flex-col 2xl:flex-row gap-2'}>
			<div className={`flex flex-col gap-2
				${showHarvestChart && strategyHarvestHistory.length > 0 ? '2xl:w-1/2' : 'w-full'}`}>
				<div className={'flex items-center sm:items-start justify-between'}>
					<div className={'flex items-center gap-2'}>
						<A target={'_blank'} href={getAddressExplorer(provider.network.chainId, strategy.address)} rel={'noreferrer'}>{truncateAddress(strategy.address)}</A>
						<CopyButton clip={strategy.address}></CopyButton>
					</div>
					<div className={'flex items-center gap-4'}>
						<Button icon={MdHistory} 
							title={'Harvest history'} 
							onClick={() => setShowHarvestHistory(current => !current)}
							iconClassName={'text-2xl'} />
						<Button icon={TbTractor} 
							title={`Harvest ${strategy.name}`} 
							onClick={() => simulator.harvest(strategy)}
							ping={simulator.simulatingStrategy[strategy.address]}
							disabled={simulator.simulatingStrategy[strategy.address]} 
							iconClassName={'text-2xl'} />
					</div>
				</div>

				<h2 className={'font-bold text-2xl break-words truncate'}>{strategy.name}</h2>

				<div className={'grid grid-cols-4'}>
					<div className={'col-span-2 text-sm'}>{'Risk Group'}</div>
					<div className={'text-sm text-right'}>{'TVL Impact'}</div>
					<div className={'text-sm text-right'}>{'Median Risk'}</div>
					<div className={'col-span-2 break-words truncate'}><LinkButton to={`/risk/${strategy.risk.riskGroupId}`}>{strategy.risk.riskGroup}</LinkButton></div>
					<div className={'text-right flex items-center justify-end'}>
						<div className={`
							px-2 flex items-center justify-center
							text-sm rounded-lg
							${scoreToBgColor(strategy.risk.riskDetails.TVLImpact)}`}>
							{translateTvlImpact(strategy.risk.riskDetails.TVLImpact)}
						</div>
					</div>
					<div className={'text-right flex items-center justify-end'}>
						<div className={`
							px-2 flex items-center justify-center text-sm rounded-lg
							${scoreToBgColor(strategy.risk.riskDetails.median)}`}>
							{translateRiskScore(strategy.risk.riskDetails.median)}
						</div>
					</div>
				</div>

				{strategy.lendStatuses?.length > 0 && 
					<div>
						<div className={'grid grid-cols-4'}>
							<div className={'col-span-2 text-sm'}>{'Lender'}</div>
							<div className={'text-sm text-right'}>{'Deposits'}</div>
							<div className={'text-sm text-right'}>{'APR'}</div>
						</div>
						{strategy.lendStatuses.map((lender, index) => 
							<div key={index} className={'grid grid-cols-4'}>
								<div className={'col-span-2'}><A target={'_blank'} rel={'noreferrer'} href={getAddressExplorer(provider.network.chainId, lender.address)}>{lender.name}</A></div>
								<Tokens value={lender.deposits} token={token} />
								<Percentage value={lender.apr/(10 ** 18)} />
							</div>)}
					</div>}

				<div className={'grid grid-cols-4'}>
					<div className={'col-span-2'}>
						<div className={'text-sm'}>{'Last harvest'}</div>
						<TimeAgo date={latestHarvest(strategy)}></TimeAgo>
					</div>
					<div>
						<div className={'text-sm text-right'}>{'Assets'}</div>
						<Tokens value={strategy.estimatedTotalAssets} token={token} />
					</div>
					<div>
						<div className={'text-sm text-right'}>{'Real ratio'}</div>
						<Percentage value={strategy.totalDebt / vault.totalAssets} />
					</div>
				</div>

				<div className={'py-2 flex items-center justify-between'}>
					<div className={'text-lg font-bold whitespace-nowrap'}>{'Target debt ratio'}</div>
					<div className={'flex items-center gap-4 font-mono text-xl'}>
						{'%'}
						<Input type={'number'} className={`
						w-[112px] py-2 px-2 inline
						border-transparent leading-tight
						text-xl text-right 
						${simulator.debtRatioUpdates[strategy.address] !== undefined
		? 'bg-selected-300 dark:bg-selected-900' 
		: 'bg-gray-300 dark:bg-gray-800'}
						focus:border-primary-400 focus:bg-gray-200 focus:ring-0
						focus:dark:border-selected-600 focus:ring-0
						rounded-md shadow-inner`}
						defaultValue={formatNumber(100 * (simulator.debtRatioUpdates[strategy.address] || strategy.debtRatio) / 10_000)}
						onChange={value => simulator.updateDebtRatio(strategy, Math.floor(parseFloat(value.target.value || 0) * 100))}
						min={0} max={100} step={0.01} />
					</div>
				</div>

				{simulator.strategyResults[strategy.address]?.status === 'ok' && <div className={`
					grid grid-cols-4`}>
					<div>{'Harvest'}</div>
					<div className={'text-center'}>{'APR'}</div>
					<div className={'text-right'}>{'Before fees'}</div>
					<div className={'text-right'}>{'After fees'}</div>
					<LinkButton className={'text-primary-600 dark:text-primary-400'} 
						to={`${location.pathname}#harvest-events-${strategy.address}`}>
						{'Success'}
					</LinkButton>
					<div></div>
					<Percentage value={simulator.strategyResults[strategy.address].output.apr.beforeFee} simulated={true} />
					<Percentage value={simulator.strategyResults[strategy.address].output.apr.afterFee} simulated={true} />

					<div></div>
					<div></div>
					<div className={'text-right'}>{'Profit'}</div>
					<div className={'text-right'}>{'Debt'}</div>
					<div></div>
					<div></div>
					<Tokens value={simulator.strategyResults[strategy.address].output.flow.profit} token={token} simulated={true} delta={true} />
					<Tokens value={simulator.strategyResults[strategy.address].output.flow.debt} token={token} simulated={true} delta={true} />
				</div>}

				{simulator.strategyResults[strategy.address]?.status === 'error' && <div>
					<div>{'Harvest'}</div>
					<A className={'text-error-600 dark:text-error-400'} target={'_blank'} href={simulator.strategyResults[strategy.address].simulationUrl} rel={'noreferrer'}>{'Failed'}</A>
				</div>}
			</div>

			{showHarvestChart && strategyHarvestHistory.length > 0 && <div className={'w-full 2xl:w-1/2 2xl:px-4'}>
				<InfoChart
					name={'APR (capped at 200%)'}
					x={strategyHarvestHistory.map(d => d['date_string']).reverse()}
					y={strategyHarvestHistory.map(d => {
						let amount = d['rough_apr_pre_fee'] * 100;
						if (amount > 200){ amount = 200; }
						return amount;
					}).reverse()}
					importData={strategyHarvestHistory} />
			</div>}
		</div>
		
		{showHarvestHistory && <HarvestHistory history={strategyHarvestHistory} />}

		<div className={`
			w-full pt-6 sm:pt-12 border-b
			${lastStrategy ? 'border-transparent' : 'border-primary-900/10 dark:border-primary-900/20'}`} />
	</div>;
}