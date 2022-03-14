import React, {useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {BsPlay, BsCaretDownFill} from 'react-icons/bs';
import {useBlocks} from './useBlocks';
import Block from './Block';
import {AddBlockDialogProvider} from '../AddBlockDialog/useAddBlockDialog';
import AddBlockDialog, {AddBlockButton} from '../AddBlockDialog';
import SelectProvider from '../SelectProvider';
import {setupTenderly, TenderlySim} from '../../ethereum/TenderlySim';
import {useSelectedProvider} from '../SelectProvider/useSelectedProvider';
import EventsDialog from './EventsDialog';

export default function Simulator() {
	const location = useLocation();
	const navigate = useNavigate();
	const {blocks, setBlocks} = useBlocks();
	const {selectedProvider} = useSelectedProvider();
	const [showEventsForBlock, setShowEventsForBlock] = useState();

	function onAddBlock(block) {
		block.index = blocks.length > 0 
			? blocks[blocks.length - 1].index + 1
			: 0;
		setBlocks(blocks => [...blocks, block]);
	}

	function onRemoveBlock(index) {
		setBlocks(blocks => {
			return blocks.filter(block => block.index !== index);
		});
	}

	function onShowBlockEvents(index) {
		setShowEventsForBlock(blocks[index]);
		navigate(`${location.pathname}#events`);
	}

	function onReset() {
		setBlocks([]);
	}

	async function onSimulate() {
		const tenderly = await setupTenderly(selectedProvider.network.chainId);
		const result = await TenderlySim(blocks, tenderly);
		setBlocks(result);
	}

	return <div className={'simulator'}>
		{blocks.map((block) => <div key={block.index}>
			<Block block={block} onRemove={onRemoveBlock} onShowEvents={onShowBlockEvents}></Block>
			<div className={'caret'}>
				<BsCaretDownFill></BsCaretDownFill>
			</div>
		</div>)}

		<div className={'mt-8 mb-32 flex flex-col items-center'}>
			<AddBlockDialogProvider>
				<AddBlockButton></AddBlockButton>
				<AddBlockDialog onAddBlock={onAddBlock}></AddBlockDialog>
			</AddBlockDialogProvider>
			<div>
				<SelectProvider disabled={blocks.length > 0}></SelectProvider>
				{blocks.length > 0 && <button onClick={onReset}>{'Reset'}</button>}
			</div>
		</div>

		<div className={'actions'}>
			<button onClick={onSimulate} disabled={blocks.length === 0}><BsPlay className={'text-4xl'}></BsPlay></button>
		</div>

		<EventsDialog block={showEventsForBlock}></EventsDialog>

	</div>;
}