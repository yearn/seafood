import React, {useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {ReactSortable} from 'react-sortablejs';
import {BsPlay} from 'react-icons/bs';
import {useBlocks} from './useBlocks';
import Block from './Block';
import {AddBlockDialogProvider} from '../AddBlockDialog/useAddBlockDialog';
import AddBlockDialog, {AddBlockButton} from '../AddBlockDialog';
import SelectProvider from '../SelectProvider';
import EventsDialog from './EventsDialog';
import {SmallScreen} from '../../utils/breakpoints';

export default function Simulator() {
	const location = useLocation();
	const navigate = useNavigate();
	const {blocks, setBlocks, addBlock, simulate, reset, removeBlock} = useBlocks();
	const [showEventsForBlock, setShowEventsForBlock] = useState();

	function onShowBlockEvents(index) {
		setShowEventsForBlock(blocks[index]);
		navigate(`${location.pathname}#events`);
	}

	return <ReactSortable list={blocks} setList={setBlocks} className={'simulator'}>
		{blocks.map((block) => 
			<div key={block.index} className={'flex flex-col justify-center'}>
				<Block block={block} onRemove={removeBlock} onShowEvents={onShowBlockEvents}></Block>
			</div>)}

		<div className={`${blocks.length === 0 ? 'mt-64' : 'mt-8'} mb-32 flex flex-col items-center`}>
			<SmallScreen>
				<AddBlockDialogProvider>
					<AddBlockButton className={'big'}></AddBlockButton>
					<AddBlockDialog onAddBlock={addBlock}></AddBlockDialog>
				</AddBlockDialogProvider>
				<div>
					<SelectProvider disabled={blocks.length > 0}></SelectProvider>
					<button disabled={blocks.length < 1} onClick={reset}>{'Reset'}</button>
				</div>
			</SmallScreen>
		</div>

		<SmallScreen>
			<div className={'actions'}>
				<button onClick={simulate} disabled={blocks.length === 0}><BsPlay className={'text-4xl'}></BsPlay></button>
			</div>
		</SmallScreen>

		<EventsDialog block={showEventsForBlock}></EventsDialog>

	</ReactSortable>;
}