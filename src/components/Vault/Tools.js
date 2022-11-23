import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useSimulator} from './SimulatorProvider';
import {useVault} from './VaultProvider';
import {Button} from '../controls';
import {BsCode} from 'react-icons/bs';
import {TbChartLine, TbTractor} from 'react-icons/tb';

export default function Tools() {
	const location = useLocation();
	const navigate = useNavigate();
	const {toggleHarvestChart} = useVault();
	const simulator = useSimulator();

	function navigateToCode() {
		simulator.resetCodeNotifications();
		navigate(`${location.pathname}#code`);
	}

	return 	<div className={'w-full flex items-center justify-center gap-4'}>
		<Button title={'Toggle harvest charts'} 
			icon={TbChartLine} 
			onClick={toggleHarvestChart}
			className={'grow'}
			iconClassName={'text-2xl'} />
		<Button title={'Get code'}
			icon={BsCode}
			onClick={navigateToCode}
			notify={simulator.codeNotifications}
			className={'grow'}
			iconClassName={'text-2xl'} />
		<Button title={'Harvest all'} 
			icon={TbTractor} 
			onClick={simulator.harvestAll} 
			ping={simulator.simulatingAll}
			disabled={simulator.simulatingAll}
			className={'grow'}
			iconClassName={'text-2xl'} />
	</div>;
}