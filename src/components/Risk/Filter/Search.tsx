import React, {useRef} from 'react';
import useKeypress from 'react-use-keypress';
import {useDebouncedCallback} from 'use-debounce';
import {Input} from '../../controls';
import {useFilter} from './Provider';

export default function Search() {
	const {query, setQuery} = useFilter();
	const queryElement = useRef<HTMLInputElement>();
	const debounceQuery = useDebouncedCallback(value => {setQuery(value);}, 250);

	useKeypress(['/'], () => {
		setTimeout(() => {
			queryElement.current?.select();
		}, 0);
	});

	return <Input
		_ref={queryElement}
		type={'text'}
		placeholder={'/ Filter by group'}
		defaultValue={query}
		onChange={(e: Event) => {debounceQuery((e.target as HTMLInputElement)?.value);}} 
		className={`
		w-44 py-2 px-3 rounded-lg leading-tight border outline-none
		bg-secondary-300 border-transparent text-primary-900
		dark:bg-secondary-900/80 dark:border-secondary-800 dark:text-primary-200
		focus:border-selected-400 focus:dark:border-selected-600 focus:ring-0`} />;
}
