import React, {useRef} from 'react';
import {BsStarFill, BsX} from 'react-icons/bs';
import useKeypress from 'react-use-keypress';
import {useDebouncedCallback} from 'use-debounce';

export default function Filter({query, setQuery, chips, setChips}) {
	const queryElement = useRef();
	const debounceQuery = useDebouncedCallback(value => {setQuery(value);}, 250);

	useKeypress(['/'], () => {
		setTimeout(() => {
			queryElement.current.select();
		}, 0);
	});

	function clearQuery() {
		setQuery('');
		queryElement.current.value = '';
	}

	function toggle(chip) {
		return () => {
			setChips(chips => {
				return {...chips, [chip]: !chips[chip]};
			});
		};
	}

	return <div className={'filter flex items-center gap-3'}>
		<div className={'relative flex items-center justify-center'}>
			<input ref={queryElement} 
				onChange={(e) => {debounceQuery(e.target.value);}} 
				defaultValue={query} 
				type={'text'} 
				placeholder={'/ Filter by name'} />
			{query && <div onClick={clearQuery} className={'absolute right-2 sm-circle-icon-button'}>
				<BsX />
			</div>}
		</div>
		<div className={'flex flex-row gap-3'}>
			{typeof chips.favorites !== 'undefined' && <div onClick={toggle('favorites')}
				className={`chip iconic favorite ${chips.favorites ? 'hot' : ''}`}>
				<BsStarFill />
			</div>}
			{Object.keys(chips).filter(key => key !== 'favorites').map(key => {
				return <div key={key} onClick={toggle(key)} 
					className={`chip ${chips[key] ? 'hot-chip' : ''}`}>{key}</div>;
			})}
		</div>
	</div>;
}