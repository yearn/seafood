import React, {useMemo, useState} from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import {Vault} from '../../context/useVaults/types';
import {getApyComputer} from '../../math/apy';
import {useSimulator} from '../../context/useSimulator';
import {useApyProbeDelta, useApyProbeResults} from '../../context/useSimulator/ProbesProvider/useApyProbe';
import useLocalStorage from '../../utils/useLocalStorage';
import {Row, Switch} from '../controls';
import {BsLightningChargeFill} from 'react-icons/bs';
import {BiBadgeCheck} from 'react-icons/bi';
import {computeDegradationTime} from '../../utils/vaults';
import {Bps, Percentage} from '../controls/Fields';

dayjs.extend(duration);

export default function ApyTab({vault}: {vault: Vault}) {
	const [apyComputer] = useState(getApyComputer(vault?.apy.type || 'v2:averaged'));
	const simulator = useSimulator();
	const [liveApy, setLiveApy] = useLocalStorage('vault.liveApy', false);
	const apyMismatch = useMemo(() => apyComputer.type !== vault?.apy.type, [apyComputer, vault]);

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
		<div className={'w-full px-2 pt-1 flex items-center justify-between'}>
			<div>
				{liveApy ? 'Live APY' : 'Exporter APY'}
				<div className={`text-xs ${apyMismatch && liveApy ? 'text-attention-600 dark:text-attention-400' : ''}`}>
					{liveApy ? apyComputer.type : vault.apy.type}
				</div>
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
					{'Future APY'}
					<div className={'text-xs'}>{degradation}</div>
				</div>
			</div>
		</div>

		<Row label={'Gross'} alt={true} heading={true}>
			<div className={'w-3/4 grid grid-cols-3'}>
				{liveApy && <Percentage value={apyProbeResults.start?.apy.gross || NaN} decimals={4} nonFinite={'--'} simulated={true} animate={true} />}
				{!liveApy && <Percentage value={vault.apy.gross} decimals={4} />}
				<Percentage value={apyProbeResults.stop?.apy.gross || NaN}  decimals={4} nonFinite={'--'} simulated={true} animate={true} />
				<Bps value={apyDelta?.gross || 0} simulated={true} sign={true} animate={true} />
			</div>
		</Row>
		<Row label={'Net'}>
			<div className={'w-3/4 grid grid-cols-3'}>
				{liveApy && <Percentage value={apyProbeResults.start?.apy.net || NaN} decimals={4} nonFinite={'--'} simulated={true} animate={true} />}
				{!liveApy && <Percentage value={vault.apy.net} decimals={4} />}
				<Percentage value={apyProbeResults.stop?.apy.net || NaN}  decimals={4} nonFinite={'--'} simulated={true} animate={true} />
				<Bps value={apyDelta?.net || 0} simulated={true} sign={true} animate={true} />
			</div>
		</Row>
		<Row label={'Weekly'} alt={true}>
			<div className={'w-3/4 grid grid-cols-3'}>
				{liveApy && <Percentage value={apyProbeResults.start?.apy[-7] || NaN} decimals={4} nonFinite={'--'} simulated={true} animate={true} />}
				{!liveApy && <Percentage value={vault.apy[-7]} decimals={4} />}
				<Percentage value={apyProbeResults.stop?.apy[-7] || NaN}  decimals={4} nonFinite={'--'} simulated={true} animate={true} />
				<Bps value={apyDelta?.[-7] || 0} simulated={true} sign={true} animate={true} />
			</div>
		</Row>
		<Row label={'Monthly'}>
			<div className={'w-3/4 grid grid-cols-3'}>
				{liveApy && <Percentage value={apyProbeResults.start?.apy[-30] || NaN} decimals={4} nonFinite={'--'} simulated={true} animate={true} />}
				{!liveApy && <Percentage value={vault.apy[-30]} decimals={4} />}
				<Percentage value={apyProbeResults.stop?.apy[-30] || NaN}  decimals={4} nonFinite={'--'} simulated={true} animate={true} />
				<Bps value={apyDelta?.[-30] || 0} simulated={true} sign={true} animate={true} />
			</div>
		</Row>
		<Row label={'Inception'} alt={true}>
			<div className={'w-3/4 grid grid-cols-3'}>
				{liveApy && <Percentage value={apyProbeResults.start?.apy.inception || NaN} decimals={4} nonFinite={'--'} simulated={true} animate={true} />}
				{!liveApy && <Percentage value={vault.apy.inception} decimals={4} />}
				<Percentage value={apyProbeResults.stop?.apy.inception || NaN}  decimals={4} nonFinite={'--'} simulated={true} animate={true} />
				<Bps value={apyDelta?.inception || 0} simulated={true} sign={true} animate={true} />
			</div>
		</Row>
		<Row label={'PPS (x1000)'}>
			<Percentage value={apyDelta?.pps || NaN}  decimals={4} sign={true} nonFinite={'--'} simulated={true} />
		</Row>
		{apyMismatch && <div className={'p-2 attention-box'}>
			{`For this vault we should use the '${vault?.apy.type}' method to calculate apy, but Seafood doesn't support that yet. Using ${apyComputer.type} for Live and Future apy instead.`}
		</div>}
	</div>;
}
