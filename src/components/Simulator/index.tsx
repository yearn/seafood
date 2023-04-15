import React, {useCallback, useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {Button} from '../controls';
import {BsCode} from 'react-icons/bs';
import {CgUndo} from 'react-icons/cg';
import {IoIosPlay} from 'react-icons/io';
import {useBlocks} from '../../context/useSimulator/BlocksProvider';
import {useSimulator} from '../../context/useSimulator';
import {useChrome} from '../Chrome';
import Code from '../Code';

export default function Simulator({className}: {className?: string}) {
	const location = useLocation();
	const navigate = useNavigate();
	const {setDialog} = useChrome();
	const {blocks, reset: resetBlocks} = useBlocks();
	const {simulating, reset: resetSimulator, initializeAndSimulate} = useSimulator();

	useEffect(() => {
		if(location.hash === '#code') setDialog({
			component: Code, 
			args: {blocks}
		});
	}, [location, setDialog, blocks]);

	const onStart = useCallback(async () => {
		if(!blocks.length) return;
		await initializeAndSimulate();
	}, [blocks, initializeAndSimulate]);

	const onReset = useCallback(() => {
		resetBlocks();
		resetSimulator();
	}, [resetBlocks, resetSimulator]);

	return 	<div className={`flex items-center justify-center gap-2 sm:gap-3 ${className}`}>
		<Button title={blocks.length ? 'Simulator code' : 'Simulator code (empty)'}
			icon={BsCode}
			badge={blocks.length ? blocks.length.toString() : undefined}
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
	</div>;
}
