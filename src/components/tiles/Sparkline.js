import React, {useEffect, useRef, useState} from 'react';
import colors from 'tailwindcss/colors';

import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';
import {Chart} from 'react-chartjs-2';

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

export default function Sarkline() {
	const chart = useRef();
	const [data, setData] = useState({datasets: []});

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false
			},
			tooltips: {
				enabled: false
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
		elements: {
			point: {
				radius: 0
			}
		},
		tooltips: {
			enabled: false
		},
		animation: {
			duration: 250
		}
	};

	function createGradient(ctx, area) {
		const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);	
		gradient.addColorStop(0, colors.purple[500]);
		gradient.addColorStop(1, colors.pink[500]);
		return gradient;
	}

	function fake() {
		return Math.floor(Math.random()*5);
	}

	useEffect(() => {
		if(chart.current) {
			setData({
				labels: ['', '', '', '', '', ''],
				datasets: [
					{
						label: 'sparkline',
						data: [fake(), fake(), fake(), fake(), fake(), fake()],
						borderColor: createGradient(chart.current.ctx, chart.current.chartArea)
					}
				]
			});
		}
	}, [chart]);

	return <Chart ref={chart} width={100} height={80} type={'line'} data={data} options={options} />;
}