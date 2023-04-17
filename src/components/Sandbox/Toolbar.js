import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {BsBox, BsCode, BsPlay} from 'react-icons/bs';
import SelectProvider from '../SelectProvider';
import {AddBlockButton} from '../AddBlockDialog';
import {useBlocks} from './useBlocks';
import {Button} from '../controls';
import {useChrome} from '../Chrome';

export default function Toolbar() {
	const location = useLocation();
	const navigate = useNavigate();
	const {overpassClassName} = useChrome();
	const {blocks, simulate, reset} = useBlocks();

	return <div className={`sticky top-0 pl-4 pr-4 py-2 flex items-center justify-between ${overpassClassName}`}>
		<div className={'flex gap-2 items-center'}>
			<SelectProvider disabled={blocks.length > 0}></SelectProvider>
			<AddBlockButton></AddBlockButton>
			<Button icon={BsPlay} label={'Simulate'} onClick={simulate} disabled={blocks.length < 1} />
		</div>

		<div className={'flex gap-2 items-center'}>
			{location.hash === '' && 
				<Button icon={BsCode} onClick={() => navigate(`${location.pathname}#code`)} />
			}
			{location.hash === '#code' && 
				<Button icon={BsBox} onClick={() => navigate(-1)} />
			}
			<Button label={'Reset'} onClick={reset} disabled={blocks.length < 1} />
		</div>
	</div>;
}