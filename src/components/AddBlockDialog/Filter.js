import React, {useRef} from 'react';
import {BsStarFill, BsX} from 'react-icons/bs';
import useKeypress from 'react-use-keypress';
import {useDebouncedCallback} from 'use-debounce';
import {Chip, Input, SmallIconButton} from '../controls';

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

	return <div className={'flex items-center gap-3'}>
		<div className={'relative flex items-center justify-center'}>
			<Input _ref={queryElement} 
				onChange={(e) => {debounceQuery(e.target.value);}} 
				defaultValue={query} 
				type={'text'}
				placeholder={'/ Filter by name'}
				className={`
				w-full py-2 px-3 rounded-lg leading-tight border
				bg-secondary-300 border-secondary-300 text-primary-900
				dark:bg-secondary-900/80 dark:border-secondary-800 dark:text-primary-200
				focus:border-selected-400 focus:dark:border-selected-600 focus:ring-0`} />
			{query && <SmallIconButton icon={BsX} onClick={clearQuery} className={'absolute right-2'} />}
		</div>
		<div className={'flex flex-row gap-3'}>
			{typeof chips.favorites !== 'undefined' && 
				<Chip icon={BsStarFill} onClick={toggle('favorites')} hot={chips.favorites} />}
			{Object.keys(chips).filter(key => key !== 'favorites').map(key => {
				return <Chip key={key} label={key} onClick={toggle(key)} hot={chips[key]}></Chip>;
			})}
		</div>
	</div>;
}