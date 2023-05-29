import React, {ChangeEvent, useRef} from 'react';
import useKeypress from 'react-use-keypress';
import {useDebouncedCallback} from 'use-debounce';
import {Input} from '../../controls';
import {useFilter} from './Provider';

export default function Search({className}: {className: string}) {
	const {query, setQuery} = useFilter();
	const queryElement = useRef<HTMLInputElement>({} as HTMLInputElement);
	const debounceQuery = useDebouncedCallback(value => {setQuery(value);}, 250);

	useKeypress(['/'], () => {
		setTimeout(() => {
			queryElement.current?.select();
		}, 0);
	});

	return <Input
		_ref={queryElement}
		type={'text'}
		placeholder={'/ Group or vault address'}
		defaultValue={query}
		onChange={(e: ChangeEvent) => {debounceQuery((e.target as HTMLInputElement)?.value);}} 
		className={`
		py-2 px-3 leading-tight border outline-none
		bg-secondary-300 border-transparent text-primary-900
		dark:bg-secondary-900/80 dark:border-secondary-800 dark:text-primary-200
		focus:border-selected-400 focus:dark:border-selected-600 focus:ring-0
		${className}`} />;
}
