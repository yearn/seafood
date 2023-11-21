import React, {ChangeEvent, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {TbTractor} from 'react-icons/tb';
import {BsChevronCompactDown, BsChevronCompactUp} from 'react-icons/bs';
import TimeAgo from 'react-timeago';
import {formatNumber, getAddressExplorer, getTxExplorer, truncateAddress} from '../../utils/utils';
import {A, Button, Input, LinkButton, Row, Switch} from '../controls';
import InfoChart from './InfoChart';
import CopyButton from './CopyButton';
import {useVault} from './VaultProvider';
import HarvestHistory from './HarvestHistory';
import {useLocation} from 'react-router-dom';
import {translateRiskScore, translateTvlImpact} from '../Risk/Score';
import {scoreToBgColor, scoreToBorderColor} from '../Risk/colors';
import {useBlocks, findDebtRatioUpdate, findHarvest, findSetDoHealthCheck} from '../../context/useSimulator/BlocksProvider';
import {useSimulator} from '../../context/useSimulator';
import {Strategy as TStrategy} from '../../context/useVaults/types';
import {BigNumber, FixedNumber, ethers} from 'ethers';
import {functions} from '../../context/useSimulator/Blocks';
import {HarvestOutput} from '../../context/useSimulator/ProbesProvider/useHarvestProbe';
import Accordian from '../controls/Accordian';
import {Bps, Number, Percentage, Tokens} from '../controls/Fields';
import EigenPhi from './EigenPhi';
import Tenderly from './Tenderly';
import {useAssetsProbeResults} from '../../context/useSimulator/ProbesProvider/useAssetsProbe';
import {DUST} from '../../constants';

function AccordianTitle({index, strategy}: {index: number, strategy: TStrategy}) {
	return <div className={`flex items-center gap-2
		${strategy.debtRatio?.gt(0) ? '' : 'text-secondary-400 dark:text-secondary-600'}`}>
		<div className={'font-mono'}>{`[${index}]`}</div>
		<div className={'font-bold text-2xl break-words truncate'}>{strategy.name}</div>
	</div>;
}

export default function Strategy({index, strategy}: {index: number, strategy: TStrategy}) {
	const location = useLocation();
	const {vault, reports} = useVault();
	const strategyHarvestHistory = reports.filter(r => r.strategy_address === strategy.address);
	const [showHarvestHistory, setShowHarvestHistory] = useState(false);
	const {blocks, addDebtRatioUpdate, removeDebtRatioUpdate, addSetDoHealthCheck, removeSetDoHealthCheck, addHarvest, removeHarvest, computeVaultDr} = useBlocks();
	const vaultDebtRatio = computeVaultDr(vault);
	const drInput = useRef<HTMLInputElement>({} as HTMLInputElement);
	const {simulating, blockPointer, results: simulatorResults, probeStartResults, probeStopResults} = useSimulator();
	const {stop: assetsProbeOutput} = useAssetsProbeResults(vault, probeStartResults, probeStopResults);

	const simulatingStrategy = useMemo(() => {
		if(!blockPointer) return false;
		return blockPointer.primitive === 'strategy' && blockPointer.contract === strategy.address
			|| (blockPointer.call.input as string[]).includes(strategy.address);
	}, [blockPointer, strategy]);

	const hasHarvestBlock = useMemo(() => {
		return Boolean(findHarvest(blocks, strategy));
	}, [blocks, strategy]);

	const latestHarvest = useMemo(() => {
		return {
			date: reports.length > 0 ? new Date(parseInt(reports[0].timestamp)) : new Date(0),
			tx: reports.length > 0 ? reports[0].txn_hash : undefined
		};
	}, [reports]);

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
			await removeHarvest(vault, strategy);
		} else {
			await addHarvest(vault, strategy);
		}
	}, [hasHarvestBlock, removeHarvest, addHarvest, vault, strategy]);

	const borderClassName = useMemo(() => {
		if(simulationError) return 'border-error-500 dark:border-error-400';
		if(simulatingStrategy || harvestResult || harvestProbeOutput) return 'border-primary-400 dark:border-primary-400/60';
		return 'dark:border-primary-900/40';
	}, [simulatingStrategy, harvestResult, harvestProbeOutput, simulationError]);

	const estimatedTotalAssets = useMemo(() => {
		if(harvestProbeOutput) return {
			simulated: true,
			value: harvestProbeOutput.estimatedTotalAssets,
			delta: harvestProbeOutput.estimatedTotalAssets.sub(strategy.estimatedTotalAssets)
		};
		return {
			simulated: false,
			value: strategy.estimatedTotalAssets,
			delta: ethers.constants.Zero
		};
	}, [strategy, harvestProbeOutput]);

	const realRatio = useMemo(() => {
		if(!vault?.totalAssets?.gt(0)) return {simulated: false, value: 0, delta: 0};
		const actual = strategy.totalDebt.mul(10_000).div(vault?.totalAssets || ethers.constants.Zero).toNumber() / 10_000;
		if(harvestProbeOutput && assetsProbeOutput) {
			const simulated = harvestProbeOutput.totalDebt.mul(10_000).div(assetsProbeOutput.totalAssets).toNumber() / 10_000;
			return {
				simulated: true,
				value: simulated,
				delta: simulated - actual
			};
		} else {
			return {
				simulated: false,
				value: actual,
				delta: 0
			};
		}
	}, [strategy, vault, harvestProbeOutput, assetsProbeOutput]);

	const healthCheck = useMemo(() => {
		if(!strategy.healthCheck || strategy.healthCheck === ethers.constants.AddressZero) return undefined;
		return strategy.healthCheck;
	}, [strategy]);

	const doHealthCheck = useMemo(() => {
		const block = findSetDoHealthCheck(blocks, strategy);
		if(block) return {checked: block.call.input[0] as boolean, simulated: true};
		return {checked: strategy.doHealthCheck, simulated: false};
	}, [blocks, strategy]);

	const toggleHealthCheck = useCallback((checked: boolean) => {
		if(!vault) return;
		const block = findSetDoHealthCheck(blocks, strategy);
		if(block) removeSetDoHealthCheck(vault, strategy);
		else addSetDoHealthCheck(vault, strategy, checked);
	}, [blocks, vault, strategy, addSetDoHealthCheck, removeSetDoHealthCheck]);

	const nonZeroRewards = useMemo(() => {
		return strategy.rewards?.filter(r => r.amount.gt(DUST)) || 0;
	}, [strategy]);

	const totalRewardsUsd = useMemo(() => {
		return strategy.rewards?.map(r => r.amountUsd).reduce((acc, reward) => acc + reward, 0) || 0;
	}, [strategy]);

	return <Accordian
		title={<AccordianTitle index={index} strategy={strategy} />}
		expanded={strategy.debtRatio?.gt(0)}
		className={`px-2 sm:px-4 py-2 border ${borderClassName}`}>

		<div className={'sm:px-2 sm:py-2 flex flex-col gap-2'}>
			<div className={'flex flex-col gap-2 w-full'}>

				<Row label={'Address'} alt={true} heading={true}>
					<div className={'flex items-center gap-4'}>
						<A target={'_blank'} href={getAddressExplorer(strategy.network.chainId, strategy.address)} rel={'noreferrer'}>{truncateAddress(strategy.address)}</A>
						<CopyButton clip={strategy.address}></CopyButton>
					</div>
				</Row>

				<Row label={<div className={'text-lg font-bold'}>{'Debt Ratio'}</div>}>
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
		? 'bg-primary-200 dark:bg-primary-800' 
		: 'bg-gray-300 dark:bg-primary-900/40'}
							${drUpdate ? 'border-primary-600 dark:border-primary-400' : ''}
							focus:border-primary-400 focus:ring-0
							focus:dark:border-selected-600 focus:ring-0
							shadow-inner`}
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
				</Row>

				<Row label={<div className={'text-lg font-bold'}>{'Health Check'}</div>} alt={true} className={!healthCheck ? 'attention-box' : ''}>
					<div className={'flex items-center gap-4'}>
						{!healthCheck && <div>{'No health check'}</div>}
						{healthCheck && <A 
							href={getAddressExplorer(strategy.network.chainId, healthCheck)} 
							target={'_blank'} rel={'noreferrer'}>
							{truncateAddress(healthCheck)}
						</A>}
						<div className={`
							p-1 flex items-center justify-center
							border ${doHealthCheck.simulated ? 'border-primary-400' : 'border-transparent'}`}>
							<Switch disabled={!healthCheck || simulating} checked={doHealthCheck.checked} onChange={toggleHealthCheck}></Switch>
						</div>
					</div>
				</Row>

				{<Row label={'Keeper'}>
					<div className={'flex items-center gap-4'}>
						{strategy.keeper && <>
							<A target={'_blank'} href={getAddressExplorer(strategy.network.chainId, strategy.keeper)} rel={'noreferrer'}>{truncateAddress(strategy.keeper)}</A>
							<CopyButton clip={strategy.keeper}></CopyButton>
						</>}
						{!strategy.keeper && <div className={'text-secondary-400'}>{'No keeper'}</div>}
					</div>
				</Row>}

				{<Row label={'Trade handler'} alt={true}>
					<div className={'flex items-center gap-4'}>
						{strategy.tradeFactory && <>
							<A target={'_blank'} href={getAddressExplorer(strategy.network.chainId, strategy.tradeFactory)} rel={'noreferrer'}>{truncateAddress(strategy.tradeFactory)}</A>
							<CopyButton clip={strategy.tradeFactory}></CopyButton>
						</>}
						{!strategy.tradeFactory && <div className={'text-secondary-400'}>{'No trade handler'}</div>}
					</div>
				</Row>}

				<Row label={'Estimated assets'}>
					<div className={'flex items-center gap-2'}>
						{estimatedTotalAssets.simulated && <Tokens
							simulated={estimatedTotalAssets.simulated}
							value={estimatedTotalAssets.delta} 
							decimals={vault?.token.decimals}
							sign={true}
							format={'(%s)'}
							className={'text-sm'} />}
						<Tokens
							simulated={estimatedTotalAssets.simulated}
							value={estimatedTotalAssets.value} 
							decimals={vault?.token.decimals}
							animate={true}
							className={'text-xl'} />
					</div>
				</Row>

				<Row label={'Real debt ratio'} alt={true}>
					<div className={'flex items-center gap-2'}>
						{realRatio.simulated && <Bps 
							simulated={true}
							value={realRatio.delta}
							sign={true}
							format={'(%s)'}
							className={'text-xs'} />}
						<Percentage simulated={realRatio.simulated} value={realRatio.value} animate={true} />
					</div>
				</Row>

				<Row label={'Last harvest'}>
					<div className={'flex items-center gap-3'}>	
						<A href={getTxExplorer(strategy.network.chainId, latestHarvest.tx)}
							target={'_blank'} rel={'noreferrer'}>
							<TimeAgo date={latestHarvest.date} />
						</A>
						<EigenPhi tx={latestHarvest.tx} />
					</div>
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
								<Tokens value={lender.deposits} decimals={vault?.token.decimals} />
								<Percentage value={FixedNumber.from(lender.apr).divUnsafe(FixedNumber.from(BigNumber.from(10).pow(18))).toUnsafeFloat()} />
							</div>
						</Row>)}
				</>}

				{strategy.tradeFactory && <>
					<Row label={'Rewards'} alt={true} heading={true}>
						<Number className={'font-bold'} value={totalRewardsUsd} decimals={2} format={'%s USD'} />
					</Row>
					{nonZeroRewards.length === 0 && <Row label={<div></div>}>
						<div className={'text-secondary-400'}>{'No available rewards'}</div>
					</Row>}
					{nonZeroRewards.length > 0 && nonZeroRewards.map((reward, index) =>
						<Row key={index} label={<A target={'_blank'} rel={'noreferrer'} href={getAddressExplorer(strategy.network.chainId, reward.token)}>{reward.symbol}</A>} alt={index % 2 === 1}>
							<div className={'w-1/2 flex items-center justify-between'}>
								<Tokens value={reward.amount} decimals={reward.decimals} />
								{reward.amountUsd === 0 && <div className={'text-secondary-400'}>{'NA'}</div>}
								{reward.amountUsd > 0 && <Number value={reward.amountUsd} decimals={2} format={'%s USD'} />}
							</div>
						</Row>)}
				</>}

				<Row label={'Risk group'} alt={true} heading={true}>
					<div className={'w-1/2 flex items-center justify-between'}>
						<div>{'Impact'}</div>
						<div>{'Median'}</div>
					</div>
				</Row>

				<Row label={<div className={'break-words truncate'}><LinkButton to={`/risk/${strategy.risk.riskGroupId}`}>{strategy.risk.riskGroup}</LinkButton></div>}>
					<div className={'w-1/2 flex items-center justify-between'}>
						<div className={`
							px-2 flex items-center justify-center text-sm border
							${scoreToBgColor(strategy.risk.riskDetails.TVLImpact, true)}
							${scoreToBorderColor(strategy.risk.riskDetails.TVLImpact)}`}>
							{translateTvlImpact(strategy.risk.riskDetails.TVLImpact as 0 | 1 | 2 | 3 | 4 | 5)}
						</div>
						<div className={`
							px-2 flex items-center justify-center text-sm border
							${scoreToBgColor(strategy.risk.riskDetails.median, true)}
							${scoreToBorderColor(strategy.risk.riskDetails.median)}`}>
							{translateRiskScore(strategy.risk.riskDetails.median as 1 | 2 | 3 | 4 | 5)}
						</div>
					</div>
				</Row>

				{harvestProbeOutput && <>
					<Row label={'Harvest simulation'} alt={true} heading={true}>
						<div className={'flex items-center gap-3'}>
							<LinkButton className={'text-primary-600 dark:text-primary-400'} to={`${location.pathname}#harvest-events-${strategy.address}`}>{'Success'}</LinkButton>
							{harvestResult?.explorerUrl && <Tenderly url={harvestResult.explorerUrl} className={'text-primary-600 dark:text-primary-400'} />}
						</div>
					</Row>
					<Row label={'Gross APR'}>
						<Percentage value={harvestProbeOutput.apr.gross} simulated={true} />
					</Row>
					<Row label={'Net APR'} alt={true}>
						<Percentage value={harvestProbeOutput.apr.net} simulated={true} />
					</Row>
					<Row label={'Profit'}>
						<Tokens value={harvestProbeOutput.flow.profit} decimals={vault?.token.decimals} simulated={true} />
					</Row>
					<Row label={'Debt'} alt={true}>
						<Tokens value={harvestProbeOutput.flow.debt} decimals={vault?.token.decimals} simulated={true} />
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
