import React from 'react';
import {BsPlayFill, BsCaretDownFill} from 'react-icons/bs';
import {useBlocks} from './useBlocks';
import Block from './Block';
import {AddBlockDialogProvider} from '../AddBlockDialog/useAddBlockDialog';
import AddBlockDialog, {AddBlockButton} from '../AddBlockDialog';
import SelectProvider from '../SelectProvider';
import useScrollOverpass from '../Header/useScrollOverpass';

export default function Simulator() {
	const {overpassClass} = useScrollOverpass();
	const {blocks, setBlocks} = useBlocks();

	function onAddBlock(block) {
		block.index = blocks.length > 0 
			? blocks[blocks.length - 1].index + 1
			: 0;
		setBlocks(blocks => [...blocks, block]);
	}

	function onRemoveBlock(blockIndex) {
		setBlocks(blocks => {
			return blocks.filter(item => item.index !== blockIndex);
		});
	}

	function onReset() {
		setBlocks([]);
	}

	return <div className={'simulator'}>
		{blocks.map((block) => <div key={block.index}>
			<Block block={block} onRemove={onRemoveBlock}></Block>
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

		<div className={`tools ${overpassClass}`}>
			<div className={'flex items-center'}>{'Simulate'}<BsPlayFill className={'text-4xl'}></BsPlayFill></div>
		</div>

	</div>;
}