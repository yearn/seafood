import React, {useMemo} from 'react';
import {Vault} from '../../context/useVaults/types';
import {Number} from '../controls/Fields';
import {useSimulator} from '../../context/useSimulator';
import {useAssetsProbeResults} from '../../context/useSimulator/ProbesProvider/useAssetsProbe';
import {BigNumber, ethers} from 'ethers';
import {getTvlSeries} from '../../utils/vaults';

export default function TvlBars({vault}: {vault: Vault}) {
	const simulator = useSimulator();
	const {start: assetsProbeStart, stop: assetsProbeStop} = useAssetsProbeResults(vault, simulator.probeStartResults, simulator.probeStopResults);
	const series = getTvlSeries(vault);
	const maxBar = 100;
	const maxSeries = Math.max(...series);
	const scale = maxBar / maxSeries;
	const bars = series.map(tvl => Math.round(scale * tvl) || 0);
	const latest = series.length > 0 ? series[series.length - 1] : 0;

	const totalAssetsDelta = useMemo(() => {
		if(assetsProbeStart && assetsProbeStop) {
			return assetsProbeStop.totalAssets.sub(assetsProbeStart.totalAssets);
		} else {
			return ethers.constants.Zero;
		}
	}, [assetsProbeStart, assetsProbeStop]);

	const tvl = useMemo(() => {
		if(totalAssetsDelta.gt(0)) {
			const delta = totalAssetsDelta.div(BigNumber.from(10).pow(vault.decimals)).toNumber() * vault.price;
			return {
				simulated: true,
				value: latest + delta,
				delta: delta
			};
		} else {
			return {
				simulated: false,
				value: latest,
				delta: 0
			};
		}
	}, [vault, latest, totalAssetsDelta]);

	return <div className={'px-2 flex flex-col'}>
		<div>{'TVL WoW'}</div>
		<div className={'relative h-48 pt-4 flex items-end justify-center gap-3'}>
			{bars.map((bar, index) => <div key={index} className={`
				grow h-[${bar}%]
				bg-gradient-to-t from-primary-600/0 to-primary-400
				dark:bg-gradient-to-t dark:from-primary-950/0 dark:to-primary-600`} />)}
			<div className={'absolute right-4 bottom-4 flex flex-col text-right'}>
				<div className={'flex items-center gap-2'}>
					{tvl.simulated && <Number
						value={tvl.delta}
						simulated={tvl.simulated}
						decimals={2}
						compact={true}
						sign={true}
						format={'(%s)'}
						className={'text'} />}
					<Number
						value={tvl.value}
						simulated={tvl.simulated}
						decimals={2}
						nonFinite={'No TVL'}
						compact={true}
						className={'text-4xl'} />
				</div>
				<div className={`${tvl.simulated ? 'text-primary-600 dark:text-primary-400' : ''}`}>{'TVL (USD)'}</div>
			</div>
		</div>
	</div>;
}
