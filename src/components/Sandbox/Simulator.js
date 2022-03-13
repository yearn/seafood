import React from 'react';
import {BsPlay, BsCaretDownFill} from 'react-icons/bs';
import {useBlocks} from './useBlocks';
import Block from './Block';
import {AddBlockDialogProvider} from '../AddBlockDialog/useAddBlockDialog';
import AddBlockDialog, {AddBlockButton} from '../AddBlockDialog';
import SelectProvider from '../SelectProvider';
import {setupTenderly, TenderlySim} from '../../ethereum/TenderlySim';
import {useSelectedProvider} from '../SelectProvider/useSelectedProvider';

export default function Simulator() {
	const {blocks, setBlocks} = useBlocks();
	const {selectedProvider} = useSelectedProvider();

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

	async function onSimulate() {
		const tenderly = await setupTenderly(selectedProvider.network.chainId);
		const result = await TenderlySim(blocks, tenderly);
		console.log('result', result);
		setBlocks(result);
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

		<div className={'actions'}>
			<button onClick={onSimulate} disabled={blocks.length === 0}><BsPlay className={'text-4xl'}></BsPlay></button>
		</div>

	</div>;
}