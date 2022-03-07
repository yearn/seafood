import React from 'react';
import {useFilter} from './useFilter';

export default function Chips() {
	const {chips, setChips} = useFilter();
	return <div className={'flex flex-col items-center'}>
		<div className={'flex flex-row'}>
			{chips.tags.map(tag => {
				return <div key={tag} onClick={() => {setChips({...chips, [tag]: !chips[tag]});}} 
					className={`chip-${tag} chip ${chips[tag] ? ` hot-${tag}` : ''}`}>{tag}</div>;
			})}
		</div>
	</div>;
}