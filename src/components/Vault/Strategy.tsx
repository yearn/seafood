import React, {ChangeEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {TbTractor} from 'react-icons/tb';
import {BsChevronCompactDown, BsChevronCompactUp} from 'react-icons/bs';
import TimeAgo from 'react-timeago';
import {formatNumber, formatPercent, formatTokens, getAddressExplorer, truncateAddress} from '../../utils/utils';
import {A, Button, Input, LinkButton} from '../controls';
import InfoChart from './InfoChart';
import CopyButton from './CopyButton';
import {Erc20, useVault} from './VaultProvider';
import HarvestHistory from './HarvestHistory';
import {useLocation} from 'react-router-dom';
import {translateRiskScore, translateTvlImpact} from '../Risk/Score';
import {scoreToBgColor} from '../Risk/colors';
import {useBlocks, findDebtRatioUpdate, findHarvest} from '../../context/useSimulator/BlocksProvider';
import {useSimulator} from '../../context/useSimulator';
import {Strategy as TStrategy} from '../../context/useVaults/types';
import {BigNumber, FixedNumber} from 'ethers';
import {functions} from '../../context/useSimulator/Blocks';
import {HarvestOutput} from '../../context/useSimulator/ProbesProvider/useHarvestProbe';
import Accordian from '../controls/Accordian';
import Row from './Row';

function AccordianTitle({index, strategy}: {index: number, strategy: TStrategy}) {
	return <div className={`flex items-center gap-2
		${strategy.debtRatio?.gt(0) ? '' : 'text-secondary-400 dark:text-secondary-600'}`}>
		<div className={'font-mono'}>{`[${index}]`}</div>
		<div className={'font-bold text-2xl break-words truncate'}>{strategy.name}</div>
	</div>;
}

function Field(
	{value, simulated, delta, className, children}: 
	{value: BigNumber | number, simulated?: boolean, delta?: number, className?: string, children: ReactNode}) {
	return <div className={`
		font-mono text-right
		${simulated ? value >= 0 
		? 'text-primary-600 dark:text-primary-400' 
		: 'text-error-600 dark:text-error-400' : ''}
		${className}`}>
		{delta && value > 0 ? '+' : '' }{children}
	</div>;	
}

function Tokens(
	{value, token, simulated, delta, className}
	: {value: BigNumber, token?: Erc20, simulated?: boolean, delta?: number, className?: string}) {
	return <Field value={value} simulated={simulated} delta={delta} className={className}>
		{formatTokens(value, token?.decimals, 2, true)}
	</Field>;
}

function Percentage(
	{value, simulated, delta, className}
	: {value: number, simulated?: boolean, delta?: number, className?: string}) {
	return <Field value={value} simulated={simulated} delta={delta} className={className}>
		{formatPercent(value)}
	</Field>;
}

export default function Strategy({index, strategy}: {index: number, strategy: TStrategy}) {
	const location = useLocation();
	const {vault, token, reports} = useVault();
	const strategyHarvestHistory = reports.filter(r => r.strategy_address === strategy.address);
	const [showHarvestHistory, setShowHarvestHistory] = useState(false);
	const {blocks, addDebtRatioUpdate, removeDebtRatioUpdate, addHarvest, removeHarvest, computeVaultDr} = useBlocks();
	const vaultDebtRatio = computeVaultDr(vault);
	const drInput = useRef<HTMLInputElement>({} as HTMLInputElement);
	const {simulating, blockPointer, results: simulatorResults, probeStopResults} = useSimulator();

	const simulatingStrategy = useMemo(() => {
		if(!blockPointer) return false;
		return blockPointer.primitive === 'strategy' && blockPointer.contract === strategy.address
			|| (blockPointer.call.input as string[]).includes(strategy.address);
	}, [blockPointer, strategy]);

	const hasHarvestBlock = useMemo(() => {
		return Boolean(findHarvest(blocks, strategy));
	}, [blocks, strategy]);

	const latestHarvest = useMemo(() => {
		return new Date(BigNumber.from(strategy.lastReport).mul(1000).toNumber());
	}, [strategy]);

	const drUpdate = useMemo(() => {
		if(!vault) return;
		return findDebtRatioUpdate(blocks, vault, strategy)?.call.input[1] as number || null;
	}, [blocks, vault, strategy]);

	const debtRatio = useMemo(() : number => {
		return drUpdate || strategy.debtRatio?.toNumber() || 0;
	}, [drUpdate, strategy]);

	const debtRatioDefaultValue = useMemo(() : string => {
		return formatNumber(100 * debtRatio / 10_000);
	}, [debtRatio]);

	useEffect(() => {
		if(!drInput.current) return;
		if(!drUpdate && parseFloat(drInput.current.value) !== (100 * debtRatio / 10_000)) {
			drInput.current.value = debtRatioDefaultValue;
		}
	}, [drUpdate, debtRatio, debtRatioDefaultValue]);

	const drUpdateResult = useMemo(() => {
		if(!vault) return;
		return simulatorResults.find(r => 
			r.block.primitive === 'vault'
			&& r.block.contract === vault.address
			&& r.block.call.signature === functions.vaults.updateDebtRatio.signature
			&& r.block.call.input[0] === strategy.address);
	}, [simulatorResults, vault, strategy]);

	const harvestResult = useMemo(() => {
		return simulatorResults.find(r => 
			r.block.primitive === 'strategy'
			&& r.block.contract === strategy.address
			&& r.block.call.signature === functions.strategies.harvest.signature);
	}, [simulatorResults, strategy]);

	const harvestProbeOutput = useMemo(() => {
		const outputs = probeStopResults
			.find(r => r.name === 'harvest')
			?.output as HarvestOutput[];
		return outputs?.find(o => o.strategy === strategy.address);
	}, [strategy, probeStopResults]);

	const simulationError = useMemo(() => {
		for(const result of [drUpdateResult, harvestResult]) {
			if(result?.status === 'error') return result;
		}
	}, [drUpdateResult, harvestResult]);

	const onChangeDebtRatio = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		if(!vault) return;
		const currentDebtRatio = strategy.debtRatio?.toNumber() || 0;
		const newDebtRatio = Math.floor(parseFloat(event.target.value || '0') * 100);
		if(newDebtRatio !== currentDebtRatio) {
			addDebtRatioUpdate(vault, strategy, newDebtRatio);
		} else {
			removeDebtRatioUpdate(vault, strategy);
		}
	}, [addDebtRatioUpdate, removeDebtRatioUpdate, vault, strategy]);

	const maxDebtRatio = useMemo(() => {
		return debtRatio + 10_000 - vaultDebtRatio.value;
	}, [debtRatio, vaultDebtRatio]);

	const toggleHarvest = useCallback(async () => {
		if(!vault) return;
		if(hasHarvestBlock) {
			await removeHarvest(strategy);
		} else {
			await addHarvest(vault, strategy);
		}
	}, [hasHarvestBlock, removeHarvest, addHarvest, vault, strategy]);

	const borderClassName = useMemo(() => {
		if(simulatingStrategy || harvestProbeOutput) return 'border-primary-400 dark:border-primary-400/60';
		if(simulationError) return 'border-error-500 dark:border-error-400';
		return 'dark:border-primary-900/40';
	}, [simulatingStrategy, harvestProbeOutput, simulationError]);

	const realRatio = useMemo(() => {
		if(!vault?.totalAssets?.gt(0)) return 0;
		return FixedNumber.from(strategy.totalDebt).divUnsafe(FixedNumber.from(vault?.totalAssets)).toUnsafeFloat();
	}, [strategy, vault]);

	return <Accordian
		title={<AccordianTitle index={index} strategy={strategy} />}
		expanded={strategy.debtRatio?.gt(0)}
		className={`px-4 py-2 border rounded-lg ${borderClassName}`}>

		<div className={'sm:px-2 sm:py-2 flex flex-col gap-2'}>
			<div className={'flex flex-col gap-2 w-full'}>

				<div className={'mb-2 flex items-center justify-between'}>
					<div className={'text-lg font-bold whitespace-nowrap truncate'}>{'Target debt ratio'}</div>
					<div className={'flex items-center gap-2 sm:gap-4'}>
						<div className={'relative flex items-center'}>
							<div className={'absolute top-[6px] left-[10px] sm:right-[8px] max-w-fit text-xl'}>{'%'}</div>
							<Input _ref={drInput}
								type={'number'}
								className={`
							w-[112px] sm:w-[140px] h-10 inline
							border-transparent leading-tight
							font-mono text-xl text-right
							${drUpdate && !simulating
		? 'bg-primary-300 dark:bg-primary-800' 
		: 'bg-gray-300 dark:bg-primary-900/40'}
							focus:border-primary-400 focus:ring-0
							focus:dark:border-selected-600 focus:ring-0
							rounded-md shadow-inner`}
								defaultValue={debtRatioDefaultValue}
								onChange={onChangeDebtRatio}
								disabled={simulating}
								min={0} max={100 * maxDebtRatio / 10_000} step={0.01} />
						</div>
						<Button icon={TbTractor}
							title={`Add harvest block for ${strategy.name}`}
							onClick={toggleHarvest}
							ping={simulatingStrategy}
							disabled={simulating}
							hot={hasHarvestBlock}
							iconClassName={'text-2xl'} />
					</div>
				</div>

				<Row label={'Address'} alt={true} heading={true}>
					<div className={'flex items-center gap-4'}>
						<A target={'_blank'} href={getAddressExplorer(strategy.network.chainId, strategy.address)} rel={'noreferrer'}>{truncateAddress(strategy.address)}</A>
						<CopyButton clip={strategy.address}></CopyButton>
					</div>
				</Row>

				<Row label={'Estimated assets'}>
					<Tokens value={strategy.estimatedTotalAssets} token={token} className={'text-xl'} />
				</Row>

				<Row label={'Real debt ratio'} alt={true}>
					<Percentage value={realRatio} />
				</Row>

				<Row label={'Last harvest'}>
					<TimeAgo date={latestHarvest}></TimeAgo>
				</Row>

				{(strategy.lendStatuses?.length || 0) > 0 && <>
					<Row label={'Lenders'} alt={true} heading={true}>
						<div className={'w-1/2 flex items-center justify-between'}>
							<div>{'Deposits'}</div>
							<div>{'APR'}</div>
						</div>
					</Row>

					{strategy.lendStatuses?.map((lender, index) => 
						<Row key={index} label={<A target={'_blank'} rel={'noreferrer'} href={getAddressExplorer(strategy.network.chainId, lender.address)}>{lender.name}</A>}>
							<div className={'w-1/2 flex items-center justify-between'}>
								<Tokens value={lender.deposits} token={token} />
								<Percentage value={FixedNumber.from(lender.apr).divUnsafe(FixedNumber.from(BigNumber.from(10).pow(18))).toUnsafeFloat()} />
							</div>
						</Row>)}
				</>}

				<Row label={'Risk group'} alt={true} heading={true}>
					<div className={'w-1/2 flex items-center justify-between'}>
						<div>{'TVL Impact'}</div>
						<div>{'Median Risk'}</div>
					</div>
				</Row>

				<Row label={<div className={'break-words truncate'}><LinkButton to={`/risk/${strategy.risk.riskGroupId}`}>{strategy.risk.riskGroup}</LinkButton></div>}>
					<div className={'w-1/2 flex items-center justify-between'}>
						<div className={`
							px-2 flex items-center justify-center
							text-sm rounded-lg
							${scoreToBgColor(strategy.risk.riskDetails.TVLImpact)}`}>
							{translateTvlImpact(strategy.risk.riskDetails.TVLImpact as 0 | 1 | 2 | 3 | 4 | 5)}
						</div>
						<div className={`
							px-2 flex items-center justify-center text-sm rounded-lg
							${scoreToBgColor(strategy.risk.riskDetails.median)}`}>
							{translateRiskScore(strategy.risk.riskDetails.median as 1 | 2 | 3 | 4 | 5)}
						</div>
					</div>
				</Row>

				{harvestProbeOutput && <>
					<Row label={'Harvest simulation'} alt={true} heading={true}>
						<LinkButton className={'text-primary-600 dark:text-primary-400'} to={`${location.pathname}#harvest-events-${strategy.address}`}>{'Success'}</LinkButton>
					</Row>
					<Row label={'Gross APR'}>
						<Percentage value={harvestProbeOutput.apr.gross} simulated={true} />
					</Row>
					<Row label={'Net APR'} alt={true}>
						<Percentage value={harvestProbeOutput.apr.net} simulated={true} />
					</Row>
					<Row label={'Profit'}>
						<Tokens value={harvestProbeOutput.flow.profit} token={token} simulated={true} />
					</Row>
					<Row label={'Debt'} alt={true}>
						<Tokens value={harvestProbeOutput.flow.debt} token={token} simulated={true} />
					</Row>
				</>}

				{simulationError && <Row label={'Harvest simulation'} alt={true} heading={true}>
					<A className={'text-error-600 dark:text-error-400'} target={'_blank'} href={simulationError.explorerUrl} rel={'noreferrer'}>{'Failed'}</A>
				</Row>}
			</div>

			{strategyHarvestHistory.length > 0 && <div className={'w-full flex flex-col gap-2'}>
				<div>
					<InfoChart
						name={'APR (capped at 200%)'}
						x={strategyHarvestHistory.map(d => d.date_string).reverse()}
						y={strategyHarvestHistory.map(d => {
							let amount = parseFloat(d.rough_apr_pre_fee) * 100;
							if (amount > 200){ amount = 200; }
							return amount;
						}).reverse()} />
				</div>
				<Button icon={showHarvestHistory ? BsChevronCompactUp : BsChevronCompactDown}
					title={'Show harvest history'}
					onClick={() => setShowHarvestHistory(current => !current)}
					className={'h-6 mt-2 text-inherit bg-transparent dark:bg-transparent'}
					iconClassName={'text-2xl'} />
			</div>}
			{showHarvestHistory && <HarvestHistory history={strategyHarvestHistory} />}
		</div>

	</Accordian>;
}
