import React, {useCallback} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {Button} from '../controls';
import {BsCode} from 'react-icons/bs';
import {CgUndo} from 'react-icons/cg';
import {IoIosPlay} from 'react-icons/io';
import {useBlocks} from '../../context/useSimulator/BlocksProvider';
import {useSimulator} from '../../context/useSimulator';
import SimulatorStatus from './SimulatorStatus';

export default function Tools() {
	const location = useLocation();
	const navigate = useNavigate();
	const {blocks, reset: resetBlocks} = useBlocks();
	const {simulating, reset: resetSimulator, initializeAndSimulate} = useSimulator();

	const onStart = useCallback(async () => {
		if(!blocks.length) return;
		await initializeAndSimulate();
	}, [blocks, initializeAndSimulate]);

	const onReset = useCallback(() => {
		resetBlocks();
		resetSimulator();
	}, [resetBlocks, resetSimulator]);

	return 	<div className={'w-full flex items-center justify-center gap-4'}>
		<Button title={'Simulator code'}
			icon={BsCode}
			badge={blocks.length ? blocks.length.toString() : null}
			onClick={() => navigate(`${location.pathname}#code`)}
			disabled={!blocks.length}
			iconClassName={'text-2xl'}
			className={'grow sm:grow-0'} />
		<Button title={'Reset simulator'} 
			icon={CgUndo} 
			onClick={onReset}
			disabled={!blocks.length || simulating}
			iconClassName={'text-2xl'}
			className={'grow sm:grow-0'} />
		<Button title={'Start simulator'} 
			icon={IoIosPlay}
			onClick={onStart}
			ping={simulating}
			disabled={!blocks.length || simulating}
			iconClassName={'text-2xl'}
			className={'grow sm:grow-0'} />
		<SimulatorStatus className={'hidden sm:flex'} />
	</div>;
}
