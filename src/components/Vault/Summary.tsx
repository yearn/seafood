import React, {useEffect, useState, useMemo, ReactNode} from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import {TiWarning} from 'react-icons/ti';
import {BigNumber, ethers, FixedNumber} from 'ethers';
import {formatTokens, formatPercent, formatBps} from '../../utils/utils';
import {useVault} from './VaultProvider';
import {Row, Switch, Tooltip} from '../controls';
import {BsLightningChargeFill} from 'react-icons/bs';
import {BiBadgeCheck} from 'react-icons/bi';
import useLocalStorage from '../../utils/useLocalStorage';
import VaultTvl from '../tiles/VaultTvl';
import {computeDegradationTime} from '../../utils/vaults';
import {useSimulator} from '../../context/useSimulator';
import {ApyOutput} from '../../context/useSimulator/ProbesProvider/useApyProbe';
import {BPS} from '../../constants';
import {Apy} from '../../math/apy/types';
import {useBlocks} from '../../context/useSimulator/BlocksProvider';
import {getApyComputer} from '../../math/apy';

dayjs.extend(duration);

function Cell({className, children}: {className?: string, children?: ReactNode}) {
	return <div className={`${className}`}>{children}</div>;
}

function BpsCell({value}: {value?: number}) {
	if(!value) {
		return <Cell className={'font-mono text-right text-primary-600 dark:text-primary-400'}>
			{'--'}
		</Cell>;
	} else {
		return <Cell className={`
			font-mono text-right
			${value < 0 ? 'text-red-400' : 'text-primary-600 dark:text-primary-400'}`}>
			{`${Number.isFinite(value) ? value < 0 ? '' : '+' : ''}${formatBps(value, '--')}`}
		</Cell>;
	}
}

export default function Summary({className}: {className: string}) {
	const {vault, token} = useVault();
	const simulator = useSimulator();
	const {computeVaultDr} = useBlocks();
	const [apyDelta, setApyDelta] = useState<Apy|null>(null);
	const [liveApy, setLiveApy] = useLocalStorage('vault.liveApy', false);
	const [apyComputer] = useState(getApyComputer(vault?.apy.type || 'v2:averaged'));
	const vaultDebtRatio = computeVaultDr(vault);

	const apyProbeResult = useMemo(() => {
		if(!vault) return {} as {
			start: ApyOutput | null | undefined,
			stop: ApyOutput | null | undefined
		};

		const start = (simulator.probeStartResults
			.find(r => r.name === 'apy')
			?.output as ApyOutput[])
			?.find(o => o.vault === vault.address);

		const stop = (simulator.probeStopResults
			.find(r => r.name === 'apy')
			?.output as ApyOutput[])
			?.find(o => o.vault === vault.address);

		return {start, stop};
	}, [vault, simulator.probeStartResults, simulator.probeStopResults]);

	const degradation = useMemo(() => {
		if(!vault) return '';
		const degradationTime = computeDegradationTime(vault);
		const duration = dayjs.duration(degradationTime.mul(1000).toNumber());
		if(duration.asHours() >= 1) return ` (+${Math.floor(duration.asHours())}hr degradation)`;
		return ` (+${Math.floor(duration.asMinutes())}min degradation)`;
	}, [vault]);

	useEffect(() => {
		if(!vault) return;
		if(apyProbeResult.start && apyProbeResult.stop) {
			const pps = FixedNumber.from((apyProbeResult.stop.apy.pps as BigNumber)
				.sub(apyProbeResult.start.apy.pps))
				.divUnsafe(FixedNumber.from(apyProbeResult.start.apy.pps))
				.mulUnsafe(BPS)
				.toUnsafeFloat();

			const startApy = liveApy
				? apyProbeResult.start.apy
				: vault.apy;

			setApyDelta({
				[-7]: apyProbeResult.stop.apy[-7] - startApy[-7],
				[-30]: apyProbeResult.stop.apy[-30] - startApy[-30],
				inception: apyProbeResult.stop.apy.inception - startApy.inception,
				net: apyProbeResult.stop.apy.net - startApy.net,
				gross: apyProbeResult.stop.apy.gross - startApy.gross,
				pps
			});
		} else {
			setApyDelta(null);
		}
	}, [apyProbeResult, vault, liveApy]);

	const allocated = useMemo(() => {
		if((vault?.totalAssets || ethers.constants.Zero).eq(0)) return 0;
		return vaultDebtRatio.value / BPS.toUnsafeFloat();
	}, [vault, vaultDebtRatio]);

	const utilization = useMemo(() => {
		if(!vault) return 0;
		if((vault?.depositLimit || ethers.constants.Zero).eq(0)) return NaN;
		const availableDepositLimit = FixedNumber.from(vault.availableDepositLimit || 0);
		const depositLimit = FixedNumber.from(vault.depositLimit);
		return 1 - availableDepositLimit.divUnsafe(depositLimit).toUnsafeFloat();
	}, [vault]);

	return <div className={`
		self-start px-4 sm:pl-8 sm:pr-4 flex flex-col
		gap-4 sm:gap-8
		${className}`}>
		<div className={'flex flex-col sm:flex-row sm:gap-8'}>
			<div className={'w-full sm:w-[60%]'}>
				<Row label={'Total Assets'} className={'font-bold text-2xl'}>
					<Cell className={'font-bold font-mono text-3xl text-right'}>{formatTokens(vault?.totalAssets, token?.decimals, 2, true)}</Cell>
				</Row>
				<Row label={'Free assets'} alt={true} heading={true}>
					<Cell className={'font-mono text-right'}>{formatTokens(vault?.totalAssets?.sub(vault?.totalDebt || 0), token?.decimals, 2, true)}</Cell>
				</Row>
				<Row label={'Allocated'}>
					<Cell className={
						`font-mono text-right 
						${vaultDebtRatio.touched ? 'text-primary-600 dark:text-primary-400' : ''}`}>
						{formatPercent(allocated, 2, '--')}
					</Cell>
				</Row>
				<Row label={'Deposit limit'} alt={true}>
					<Cell className={'font-mono text-right'}>{formatTokens(vault?.depositLimit, token?.decimals, 2, true)}</Cell>
				</Row>
				<Row label={'Utilization'}>
					<Cell className={'font-mono text-right'}>{formatPercent(utilization, 2)}</Cell>
				</Row>
			</div>
			<div className={'w-full h-48 sm:h-auto sm:w-[40%] my-2 sm:my-0'}>
				<VaultTvl vault={vault} title={true} tooltips={true} />
			</div>
		</div>

		<div className={'mb-4'}>
			<div className={'w-full flex items-center justify-between'}>
				<Cell>
					{'Current APY'}
					{apyComputer.type === vault?.apy.type && <>
						<div className={'text-xs'}>{vault.apy.type}</div>
					</>}
					{apyComputer.type !== vault?.apy.type && <>
						<div 
							data-tip={`><(((*> - This vault should use the '${vault?.apy.type}' method to calculate apy, but Seafood doesn't support that yet. Using ${apyComputer.type} for now!`}
							className={'w-fit flex items-center gap-1 text-xs text-attention-600 dark:text-attention-400 cursor-default'}>
							<Tooltip place={'top'} type={'dark'} effect={'solid'} />
							<TiWarning />
							{apyComputer.type}
						</div>
					</>}
				</Cell>
				<div className={'w-[60%] flex items-center justify-between'}>
					<Cell className={'flex justify-end'}>
						<div title={liveApy ? 'Switch to exporter APY' : 'Switch to live APY'}>
							<Switch
								onChange={() => setLiveApy((current: boolean) => !current)}
								checkedIcon={<BsLightningChargeFill className={'w-full h-full p-1'} />}
								uncheckedIcon={<BiBadgeCheck className={'w-full h-full p-1'} />}
								checked={liveApy} />
						</div>
					</Cell>
					<Cell className={'col-span-2 text-primary-600 dark:text-primary-400 text-right'}>
						{'Simulated APY'}
						<div className={'text-xs'}>{degradation}</div>
					</Cell>
				</div>
			</div>

			<Row label={'Gross'} alt={true} heading={true}>
				<div className={'w-3/4 grid grid-cols-3'}>
					{liveApy && <Cell className={'font-mono text-right text-primary-600 dark:text-primary-400'}>{formatPercent(apyProbeResult.start?.apy.gross, 4, '--')}</Cell>}
					{!liveApy && <Cell className={'font-mono text-right'}>{formatPercent(vault?.apy.gross, 4)}</Cell>}
					<Cell className={'font-mono text-primary-600 dark:text-primary-400 text-right'}>{formatPercent(apyProbeResult.stop?.apy.gross, 4, '--')}</Cell>
					<BpsCell value={apyDelta?.gross} />
				</div>
			</Row>
			<Row label={'Net'}>
				<div className={'w-3/4 grid grid-cols-3'}>
					{liveApy && <Cell className={'font-bold font-mono text-right text-primary-600 dark:text-primary-400'}>{formatPercent(apyProbeResult.start?.apy.net, 4, '--')}</Cell>}
					{!liveApy && <Cell className={'font-bold font-mono text-right'}>{formatPercent(vault?.apy.net, 4)}</Cell>}
					<Cell className={'font-bold font-mono text-primary-600 dark:text-primary-400 text-right'}>{formatPercent(apyProbeResult.stop?.apy.net, 4, '--')}</Cell>
					<BpsCell value={apyDelta?.net} />
				</div>
			</Row>
			<Row label={'Weekly'} alt={true}>
				<div className={'w-3/4 grid grid-cols-3'}>
					{liveApy && <Cell className={'font-mono text-right text-primary-600 dark:text-primary-400'}>{formatPercent(apyProbeResult.start?.apy[-7], 4, '--')}</Cell>}
					{!liveApy && <Cell className={'font-mono text-right'}>{formatPercent(vault?.apy[-7], 4)}</Cell>}
					<Cell className={'font-mono text-primary-600 dark:text-primary-400 text-right'}>{formatPercent(apyProbeResult.stop?.apy[-7], 4, '--')}</Cell>
					<BpsCell value={apyDelta?.[-7]} />
				</div>
			</Row>
			<Row label={'Monthly'}>
				<div className={'w-3/4 grid grid-cols-3'}>
					{liveApy && <Cell className={'font-mono text-right text-primary-600 dark:text-primary-400'}>{formatPercent(apyProbeResult.start?.apy[-30], 4, '--')}</Cell>}
					{!liveApy && <Cell className={'font-mono text-right'}>{formatPercent(vault?.apy[-30], 4)}</Cell>}
					<Cell className={'font-mono text-primary-600 dark:text-primary-400 text-right'}>{formatPercent(apyProbeResult.stop?.apy[-30], 4, '--')}</Cell>
					<BpsCell value={apyDelta?.[-30]} />
				</div>
			</Row>
			<Row label={'Inception'} alt={true}>
				<div className={'w-3/4 grid grid-cols-3'}>
					{liveApy && <Cell className={'font-mono text-right text-primary-600 dark:text-primary-400'}>{formatPercent(apyProbeResult.start?.apy.inception, 4, '--')}</Cell>}
					{!liveApy && <Cell className={'font-mono text-right'}>{formatPercent(vault?.apy.inception, 4)}</Cell>}
					<Cell className={'font-mono text-primary-600 dark:text-primary-400 text-right'}>{formatPercent(apyProbeResult.stop?.apy.inception, 4, '--')}</Cell>
					<BpsCell value={apyDelta?.inception} />
				</div>
			</Row>
			<Row label={'PPS (x1000)'}>
				<Cell className={`font-mono
					${(apyDelta?.pps || 0) < 0 ? 'text-red-400' : 'text-primary-600 dark:text-primary-400 text-right'}`}>
					{(apyDelta?.pps || 0) > 0 ? '+' : ''}{formatPercent(apyDelta?.pps, 2, '--')}
				</Cell>
			</Row>
		</div>
	</div>;
}
