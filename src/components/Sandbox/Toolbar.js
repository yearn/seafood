import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {BsBox, BsCode, BsPlay} from 'react-icons/bs';
import SelectProvider from '../SelectProvider';
import {AddBlockDialogProvider} from '../AddBlockDialog/useAddBlockDialog';
import AddBlockDialog, {AddBlockButton} from '../AddBlockDialog';
import useScrollOverpass from '../Header/useScrollOverpass';
import {useBlocks} from './useBlocks';

export default function Toolbar() {
	const location = useLocation();
	const navigate = useNavigate();
	const {overpassClass} = useScrollOverpass();
	const {blocks, addBlock, simulate, reset} = useBlocks();

	return <div className={`toolbar ${overpassClass}`}>
		<div className={'flex gap-2 items-center'}>
			<SelectProvider disabled={blocks.length > 0}></SelectProvider>
			<AddBlockDialogProvider>
				<AddBlockButton></AddBlockButton>
				<AddBlockDialog onAddBlock={addBlock}></AddBlockDialog>
			</AddBlockDialogProvider>
			<div className={'button-ring-container'}>
				<button onClick={simulate} disabled={blocks.length < 1} className={'iconic'}>
					{'Simulate'}
					<BsPlay className={'text-xl'}></BsPlay>
				</button>
			</div>
		</div>

		<div className={'flex gap-2 items-center'}>
			{location.hash === '' && 
				<button onClick={() => navigate(`${location.pathname}#code`)} className={'iconic no-text'}>
					<BsCode className={'text-xl'}></BsCode>
				</button>
			}
			{location.hash === '#code' && 
				<button onClick={() => navigate(-1)} className={'iconic no-text'}>
					<BsBox className={'text-xl'}></BsBox>
				</button>
			}
			<button onClick={reset} disabled={blocks.length < 1}>{'Reset'}</button>
		</div>
	</div>;
}