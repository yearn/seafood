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
import {Line} from 'react-chartjs-2';

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

export default function InfoChart({name, x, y}) {
	const chart = useRef();
	const [data, setData] = useState({datasets: []});

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false
			},
			title: {
				display: true,
				text: name,
				color: colors.sky[800]
			}
		},
		animation: {
			duration: 250
		},
		scales: {
			x: {
				display: false
			},
			y: {
				position: 'right',
				grid: {
					display: false
				},
				ticks: {
					color: colors.sky[800],
				}
			}
		}
	};

	function createGradient(ctx, area) {
		const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);	
		gradient.addColorStop(0, colors.purple[500]);
		gradient.addColorStop(1, colors.pink[500]);
		return gradient;
	}

	useEffect(() => {
		if(chart.current) {
			setData({
				labels: x,
				datasets: [{
					label: name,
					data: y,
					borderColor: createGradient(chart.current.ctx, chart.current.chartArea),
					backgroundColor: 'rgba(255, 99, 132, 0.5)'
				}]
			});
		}
	}, [chart, name, x, y]);

	return <Line ref={chart} options={options} data={data} />;
}