import React from 'react';
import {BsStarFill} from 'react-icons/bs';
import {useFilter} from './useFilter';
import config from '../../config';

export default function Chips() {
	const {chips, setChips} = useFilter();

	function toggle(chip) {
		return () => {
			setChips(chips => {
				return {...chips, [chip]: !chips[chip]};
			});
		};
	}

	return <div className={'flex flex-col items-center'}>
		<div className={'flex flex-row gap-3'}>
			<div onClick={toggle('favorites')}
				className={`chip iconic favorite ${chips.favorites ? 'hot' : ''}`}>
				<BsStarFill />
			</div>

			<div onClick={toggle('curve')} className={`chip ${chips.curve ? 'hot-chip' : ''}`}>
				{'curve'}
			</div>

			{config.chains.map(chain => 
				<div key={chain.id} onClick={toggle(chain.name)} className={`chip ${chips[chain.name] ? 'hot-chip' : ''}`}>
					{chain.name}
				</div>
			)}
		</div>
	</div>;
}