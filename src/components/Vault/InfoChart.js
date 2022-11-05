import React, {useEffect, useRef, useState} from 'react';
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
				position: 'top'
			}
		},
		animation: {
			duration: 500
		},
		scales: {
			x: {
				display: false
			},
			y: {
				position: 'right',
				grid: {
					display: false
				}
			}
		}
	};

	function createGradient(ctx, area) {
		const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);	
		gradient.addColorStop(0, '#a855f7');
		gradient.addColorStop(1, '#ec4899');
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