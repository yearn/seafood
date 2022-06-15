import React from 'react';
import {BsStar, BsStarFill} from 'react-icons/bs';
import {useFilter} from './useFilter';

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
		<div className={'flex flex-row gap-2'}>
			<div onClick={toggle('favorites')}
				className={`chip iconic favorite ${chips.favorites ? 'hot' : ''}`}>
				{!chips.favorites && <BsStar />}
				{chips.favorites && <BsStarFill />}
			</div>

			{chips.tags.map(tag => {
				return <div key={tag} onClick={toggle(tag)} 
					className={`chip-${tag} chip ${chips[tag] ? `hot-${tag}` : ''}`}>{tag}</div>;
			})}
		</div>
	</div>;
}