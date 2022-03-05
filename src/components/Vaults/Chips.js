import React from 'react';
import {useFilter} from './useFilter';

export default function Chips() {
	const {chips, setChips} = useFilter();

	function chip(tag) {
		return <div onClick={() => {setChips({...chips, [tag]: !chips[tag]});}} 
			className={`chip-${tag} chip ${chips[tag] ? ` hot-${tag}` : ''}`}>{tag}</div>;
	}

	return <div className={'flex flex-col items-center'}>
		<div className={'flex flex-row'}>
			{chip('curve')}
			{chip('ethereum')}
			{chip('fantom')}
		</div>
	</div>;
}