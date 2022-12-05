import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import colors from 'tailwindcss/colors';
import dayjs from 'dayjs';
import {Bar} from 'react-chartjs-2';
import {formatNumber} from '../../utils/utils';
import {useChrome} from '../Chrome';

import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	Title,
	Tooltip,
	Legend,
	BarElement,
} from 'chart.js';

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	BarElement,
	Title,
	Tooltip,
	Legend
);

export default function VaultTvl({vault, title = false, tooltips = false, animate = false}) {
	const chart = useRef();
	const [data, setData] = useState({datasets: []});
	const {darkMode} = useChrome();

	const tvlSeries = useMemo(() => {
		if(vault) {
			if(!vault.tvls?.tvls?.length) {
				return null;
			} else {
				return [vault.tvls.dates.slice(-3), vault.tvls.tvls.slice(-3)];
			}
		}
	}, [vault]);

	const latestTvl = useMemo(() => {
		if(tvlSeries) return tvlSeries[1][tvlSeries[1].length - 1];
	}, [tvlSeries]);

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false
			},
			title: {
				display: title,
				position: 'top',
				padding: '0',
				text: 'TVL WoW (USD)',
				color: colors.sky[800]
			},
			tooltip: {
				enabled: tooltips
			}
		},
		scales: {
			x: {
				display: false,
				grid: {
					display: false
				},
				ticks: {
					display: false
				}
			},
			y: {
				display: false,
				grid: {
					display: false
				},
				ticks: {
					display: false
				}
			}
		},
		animation: {
			duration: animate ? 200 : 0
		}
	};

	const createGradient = useCallback((ctx, area) => {
		const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);	
		gradient.addColorStop(0, 'transparent');
		gradient.addColorStop(1, darkMode ? colors.pink[600] : colors.pink[200]);
		return gradient;
	}, [darkMode]);

	useEffect(() => {
		if(chart.current && tvlSeries) {
			const labels = tvlSeries[0].map(timestamp => dayjs(new Date(timestamp)).format('MM/DD/YYYY'));
			setData({
				labels,
				datasets: [
					{
						label: 'TVL (USD)',
						data: [...tvlSeries[1]],
						backgroundColor: createGradient(chart.current.ctx, chart.current.chartArea),
						borderWidth: 0,
						borderRadius: 6
					}
				]
			});
		}
	}, [chart, tvlSeries, createGradient]);

	return <div className={`
		relative w-full h-full flex items-center justify-center`}>
		{tvlSeries && <>
			<Bar ref={chart} width={100} height={80} data={data} options={options} />
			<div className={`
				absolute bottom-0 right-0
				flex flex-col items-end
				drop-shadow-lg`}>
				<div className={'font-mono font-bold text-2xl'}>{formatNumber(latestTvl, 0, '--', true)}</div>
				<div>{'TVL (USD)'}</div>
			</div>
		</>}
		{!tvlSeries && <div className={'text-error-600'}>{'No TVL'}</div>}
	</div>;
}