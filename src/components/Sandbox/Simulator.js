import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {ReactSortable} from 'react-sortablejs';
import {BsPlay} from 'react-icons/bs';
import {useBlocks} from './useBlocks';
import Block from './Block';
import {AddBlockButton} from '../AddBlockDialog';
import SelectProvider from '../SelectProvider';
import {useEventsDialog} from './EventsDialog';
import {SmallScreen} from '../../utils/breakpoints';
import {Button} from '../controls';

export default function Simulator() {
	const location = useLocation();
	const navigate = useNavigate();
	const {blocks, setBlocks, simulate, reset, removeBlock} = useBlocks();
	const {setBlock: setEventsDialogBlock} = useEventsDialog();

	function onShowBlockEvents(index) {
		setEventsDialogBlock(blocks[index]);
		navigate(`${location.pathname}#events`);
	}

	return <>
		<ReactSortable list={blocks} setList={setBlocks} className={`
			sm:pt-8 sm:pb-32
			grid grid-flow-row grid-cols-1 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4`}>
			{blocks.map((block) => 
				<div key={block.index} className={'flex flex-col justify-center'}>
					<Block block={block} onRemove={removeBlock} onShowEvents={onShowBlockEvents}></Block>
				</div>)}
		</ReactSortable>
		<SmallScreen>
			<div className={`${blocks.length === 0 ? 'mt-64' : 'mt-8'} mb-32 flex flex-col items-center gap-4`}>
				<AddBlockButton></AddBlockButton>
				<div className={'flex gap-2'}>
					<SelectProvider disabled={blocks.length > 0}></SelectProvider>
					<Button label={'Reset'} disabled={blocks.length < 1} onClick={reset} />
				</div>
			</div>
		</SmallScreen>

		<SmallScreen>
			<div className={`
				fixed bottom-0 left-0 w-full 
				px-8 py-4 flex items-center justify-center
				backdrop-blur-md`}>
				<Button icon={BsPlay} onClick={simulate} disabled={blocks.length === 0} iconClassName={'text-4xl'} />
			</div>
		</SmallScreen>
	</>;
}