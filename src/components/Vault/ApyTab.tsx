import React, {useMemo, useState} from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import {Vault} from '../../context/useVaults/types';
import {getApyComputer} from '../../math/apy';
import {useSimulator} from '../../context/useSimulator';
import {useApyProbeDelta, useApyProbeResults} from '../../context/useSimulator/ProbesProvider/useApyProbe';
import useLocalStorage from '../../utils/useLocalStorage';
import {Row, Switch, Tooltip} from '../controls';
import {TiWarning} from 'react-icons/ti';
import {BsLightningChargeFill} from 'react-icons/bs';
import {BiBadgeCheck} from 'react-icons/bi';
import {formatPercent} from '../../utils/utils';
import {computeDegradationTime} from '../../utils/vaults';
import {Bps} from '../controls/Fields';

dayjs.extend(duration);

export default function ApyTab({vault}: {vault: Vault}) {
	const [apyComputer] = useState(getApyComputer(vault?.apy.type || 'v2:averaged'));
	const simulator = useSimulator();
	const [liveApy, setLiveApy] = useLocalStorage('vault.liveApy', false);

	const apyProbeResults = useApyProbeResults(vault, simulator.probeStartResults, simulator.probeStopResults);
	const apyDelta = useApyProbeDelta(vault, apyProbeResults, liveApy);

	const degradation = useMemo(() => {
		if(!vault) return '';
		const degradationTime = computeDegradationTime(vault);
		const duration = dayjs.duration(degradationTime.mul(1000).toNumber());
		if(duration.asHours() >= 1) return ` (+${Math.floor(duration.asHours())}hr degradation)`;
		return ` (+${Math.floor(duration.asMinutes())}min degradation)`;
	}, [vault]);

	return <div className={'mb-4 flex flex-col gap-4'}>
		<div className={'w-full px-2 py-2 flex items-center justify-between'}>
			<div>
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
			</div>
			<div className={'w-[60%] flex items-center justify-between'}>
				<div className={'flex justify-end'}>
					<div title={liveApy ? 'Switch to exporter APY' : 'Switch to live APY'}>
						<Switch
							onChange={() => setLiveApy((current: boolean) => !current)}
							checkedIcon={<BsLightningChargeFill className={'w-full h-full p-1'} />}
							uncheckedIcon={<BiBadgeCheck className={'w-full h-full p-1'} />}
							checked={liveApy} />
					</div>
				</div>
				<div className={'col-span-2 text-primary-600 dark:text-primary-400 text-right'}>
					{'Simulated APY'}
					<div className={'text-xs'}>{degradation}</div>
				</div>
			</div>
		</div>

		<Row label={'Gross'} alt={true} heading={true}>
			<div className={'w-3/4 grid grid-cols-3'}>
				{liveApy && <div className={'font-mono text-right text-primary-600 dark:text-primary-400'}>{formatPercent(apyProbeResults.start?.apy.gross, 4, '--')}</div>}
				{!liveApy && <div className={'font-mono text-right'}>{formatPercent(vault?.apy.gross, 4)}</div>}
				<div className={'font-mono text-primary-600 dark:text-primary-400 text-right'}>{formatPercent(apyProbeResults.stop?.apy.gross, 4, '--')}</div>
				<Bps value={apyDelta?.gross || 0} />
			</div>
		</Row>
		<Row label={'Net'}>
			<div className={'w-3/4 grid grid-cols-3'}>
				{liveApy && <div className={'font-bold font-mono text-right text-primary-600 dark:text-primary-400'}>{formatPercent(apyProbeResults.start?.apy.net, 4, '--')}</div>}
				{!liveApy && <div className={'font-bold font-mono text-right'}>{formatPercent(vault?.apy.net, 4)}</div>}
				<div className={'font-bold font-mono text-primary-600 dark:text-primary-400 text-right'}>{formatPercent(apyProbeResults.stop?.apy.net, 4, '--')}</div>
				<Bps value={apyDelta?.net || 0} />
			</div>
		</Row>
		<Row label={'Weekly'} alt={true}>
			<div className={'w-3/4 grid grid-cols-3'}>
				{liveApy && <div className={'font-mono text-right text-primary-600 dark:text-primary-400'}>{formatPercent(apyProbeResults.start?.apy[-7], 4, '--')}</div>}
				{!liveApy && <div className={'font-mono text-right'}>{formatPercent(vault?.apy[-7], 4)}</div>}
				<div className={'font-mono text-primary-600 dark:text-primary-400 text-right'}>{formatPercent(apyProbeResults.stop?.apy[-7], 4, '--')}</div>
				<Bps value={apyDelta?.[-7] || 0} />
			</div>
		</Row>
		<Row label={'Monthly'}>
			<div className={'w-3/4 grid grid-cols-3'}>
				{liveApy && <div className={'font-mono text-right text-primary-600 dark:text-primary-400'}>{formatPercent(apyProbeResults.start?.apy[-30], 4, '--')}</div>}
				{!liveApy && <div className={'font-mono text-right'}>{formatPercent(vault?.apy[-30], 4)}</div>}
				<div className={'font-mono text-primary-600 dark:text-primary-400 text-right'}>{formatPercent(apyProbeResults.stop?.apy[-30], 4, '--')}</div>
				<Bps value={apyDelta?.[-30] || 0} />
			</div>
		</Row>
		<Row label={'Inception'} alt={true}>
			<div className={'w-3/4 grid grid-cols-3'}>
				{liveApy && <div className={'font-mono text-right text-primary-600 dark:text-primary-400'}>{formatPercent(apyProbeResults.start?.apy.inception, 4, '--')}</div>}
				{!liveApy && <div className={'font-mono text-right'}>{formatPercent(vault?.apy.inception, 4)}</div>}
				<div className={'font-mono text-primary-600 dark:text-primary-400 text-right'}>{formatPercent(apyProbeResults.stop?.apy.inception, 4, '--')}</div>
				<Bps value={apyDelta?.inception || 0} />
			</div>
		</Row>
		<Row label={'PPS (x1000)'}>
			<div className={`font-mono
				${(apyDelta?.pps as number || 0) < 0 ? 'text-red-400' : 'text-primary-600 dark:text-primary-400 text-right'}`}>
				{(apyDelta?.pps as number || 0) > 0 ? '+' : ''}{formatPercent(apyDelta?.pps, 2, '--')}
			</div>
		</Row>
	</div>;
}
