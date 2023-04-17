import React from 'react';
import {Vault} from '../../context/useVaults/types';
import {Field} from '../controls/Fields';
import {formatNumber} from '../../utils/utils';

function getTvlSeries(vault: Vault) {
	if(!vault.tvls?.tvls?.length) return [];
	return [vault.tvls.dates.slice(-3), vault.tvls.tvls.slice(-3)][1];
}

export default function TvlBars({vault}: {vault: Vault}) {
	const series = getTvlSeries(vault);
	const maxBar = 100;
	const maxSeries = Math.max(...series);
	const scale = maxBar / maxSeries;
	const bars = series.map(tvl => Math.round(scale * tvl) || 0);
	const latest = series.length > 0 ? series[series.length - 1] : 0;
	return <div className={'px-2 flex flex-col'}>
		<div>{'TVL WoW'}</div>
		<div className={'relative h-48 pt-4 flex items-end justify-center gap-3'}>
			{bars.map((bar, index) => <div key={index} className={`
				grow h-[${bar}%]
				bg-gradient-to-t from-primary-600/0 to-primary-400
				dark:bg-gradient-to-t dark:from-primary-950/0 dark:to-primary-600`} />)}
			<div className={'absolute right-4 bottom-4 flex flex-col text-right'}>
				<Field value={formatNumber(latest, 2, 'No TVL', true)} className={'text-4xl'} />
				<div>{'TVL (USD)'}</div>
			</div>
		</div>
	</div>;
}
