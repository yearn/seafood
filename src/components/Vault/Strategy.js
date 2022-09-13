import React, {useMemo, useState} from 'react';
import {TbHistory, TbTractor} from 'react-icons/tb';
import TimeAgo from 'react-timeago';
import {formatNumber, formatPercent, formatTokens, getAddressExplorer, truncateAddress} from '../../utils/utils';
import {A, Button, Input} from '../controls';
import InfoChart from './InfoChart';
import CopyButton from './CopyButton';
import {useVault} from './VaultProvider';
import HarvestHistory from './HarvestHistory';
import {useSimulator} from './SimulatorProvider';

export default function Strategy({strategy}) {
	const {vault, provider, token, harvestHistory, showHarvestChart} = useVault();
	const simulator = useSimulator();
	const strategyHarvestHistory = harvestHistory.filter(h => h.strategy_address === strategy.address);
	const [showHarvestHistory, setShowHarvestHistory] = useState(false);
	const lastStrategy = useMemo(() => strategy.address === vault.strategies.at(-1).address, [strategy, vault]);

	function latestHarvest(strategy) {
		return new Date(strategy.lastReport * 1000);
	}

	return <div className={`
		px-4 pt-2 sm:pt-4 sm:px-12 flex flex-col gap-2`}>

		<div className={'flex flex-col sm:flex-row gap-2'}>
			<div className={'sm:max-w-prose sm:w-[65ch] flex flex-col gap-2'}>
				<div className={'flex items-center justify-between'}>
					<div className={'flex items-center gap-2'}>
						<A target={'_blank'} href={getAddressExplorer(provider.network.chainId, strategy.address)} rel={'noreferrer'}>{truncateAddress(strategy.address)}</A>
						<CopyButton clip={strategy.address}></CopyButton>
					</div>
					<div className={'flex items-center gap-4'}>
						<Button icon={TbHistory} 
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

				<h2 className={'font-bold text-2xl break-words'}>{strategy.name}</h2>

				{strategy.lendStatuses.length > 0 && 
					<div>
						<div className={'grid grid-cols-4'}>
							<div className={'col-span-2'}>{'Lender'}</div>
							<div className={'text-right'}>{'Deposits'}</div>
							<div className={'text-right'}>{'APR'}</div>
						</div>
						{strategy.lendStatuses.map((lender, index) => 
							<div key={index} className={'grid grid-cols-4'}>
								<div className={'col-span-2'}><A target={'_blank'} rel={'noreferrer'} href={getAddressExplorer(provider.network.chainId, lender.address)}>{lender.name}</A></div>
								<div className={'text-right font-mono'}>{formatTokens(lender.deposits, token.decimals, 2, true)}</div>
								<div className={'text-right font-mono'}>{formatPercent(lender.apr/(10 ** 18))}</div>
							</div>)}
					</div>}

				<div className={'grid grid-cols-4'}>
					<div className={'col-span-2'}>
						<div>{'Last harvest'}</div>
						<TimeAgo date={latestHarvest(strategy)}></TimeAgo>
					</div>
					{strategy.totalDebt > 0 && <>
						<div>
							<div className={'text-right'}>{'Assets'}</div>
							<div className={'text-right font-mono'}>{formatTokens(strategy.estimatedTotalAssets, token.decimals, 2, true)}</div>
						</div>
						<div>
							<div className={'text-right'}>{'Real ratio'}</div>
							<div className={'text-right font-mono'}>{formatPercent(strategy.totalDebt / vault.totalAssets)}</div>
						</div>
					</>}
				</div>

				{strategy.totalDebt > 0 && <div className={'py-2 flex items-center justify-between'}>
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
				</div>}

				{simulator.strategyResults[strategy.address]?.status === 'ok' && <div className={`
					grid grid-cols-4`}>
					<div>{'Harvest'}</div>
					<div className={'text-center'}>{'APR'}</div>
					<div className={'text-right'}>{'Before fees'}</div>
					<div className={'text-right'}>{'After fees'}</div>
					<A className={'text-primary-600 dark:text-primary-400'} target={'_blank'} href={simulator.strategyResults[strategy.address].simulationUrl} rel={'noreferrer'}>{'Success'}</A>
					<div></div>
					<div className={'font-mono text-right text-primary-600 dark:text-primary-400'}>{formatPercent(simulator.strategyResults[strategy.address].output.apr.beforeFee)}</div>
					<div className={'font-mono text-right text-primary-600 dark:text-primary-400'}>{formatPercent(simulator.strategyResults[strategy.address].output.apr.afterFee)}</div>
				</div>}

				{simulator.strategyResults[strategy.address]?.status === 'error' && <div>
					<div>{'Harvest'}</div>
					<A className={'text-error-600 dark:text-error-400'} target={'_blank'} href={simulator.strategyResults[strategy.address].simulationUrl} rel={'noreferrer'}>{'Failed'}</A>
				</div>}
			</div>

			{showHarvestChart && strategyHarvestHistory.length > 0 && <div className={'grow'}><InfoChart
				name={'APR (capped at 200 %)'}
				x={strategyHarvestHistory.map(d => d['date_string']).reverse()}
				y={strategyHarvestHistory.map(d => {
					let amount = d['rough_apr_pre_fee'] * 100;
					if (amount > 200){ amount = 200; }
					return amount;
				}).reverse()}
				importData={strategyHarvestHistory} /></div>}
		</div>
		
		{showHarvestHistory && <HarvestHistory history={strategyHarvestHistory} />}

		<div className={`
			w-full pt-6 sm:pt-12 border-b
			${lastStrategy ? 'border-transparent' : 'border-primary-900/10 dark:border-primary-900/20'}`} />
	</div>;
}