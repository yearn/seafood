import React from 'react';
import {Button} from '../controls';
import {BsCode} from 'react-icons/bs';
import {TbChartLine, TbTractor} from 'react-icons/tb';
import useScrollOverpass from '../../context/useScrollOverpass';
import {useSimulator} from './SimulatorProvider';
import {useVault} from './VaultProvider';
import {useLocation, useNavigate} from 'react-router-dom';

export default function Toolbar() {
	const location = useLocation();
	const navigate = useNavigate();
	const {showClassName} = useScrollOverpass();
	const {toggleHarvestChart} = useVault();
	const simulator = useSimulator();

	function navigateToCode() {
		simulator.resetCodeNotifications();
		navigate(`${location.pathname}#code`);
	}

	return <div className={`
		fixed bottom-0 z-10
		w-full px-4 py-4
		flex flex-col items-center gap-4
		border-t border-secondary-900
		${showClassName}`}>
		<div className={'w-full flex items-center justify-center gap-4'}>
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
		</div>
	</div>;
}