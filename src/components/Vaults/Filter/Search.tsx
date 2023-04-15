import React, {ChangeEvent, useRef} from 'react';
import useKeypress from 'react-use-keypress';
import {useDebouncedCallback} from 'use-debounce';
import {Input, SmallIconButton} from '../../controls';
import {useFilter} from './useFilter';
import {BsX} from 'react-icons/bs';

export default function Search({className}: {className: string}) {
	const {query, setQuery} = useFilter();
	const queryElement = useRef<HTMLInputElement>({} as HTMLInputElement);
	const debounceQuery = useDebouncedCallback(value => {setQuery(value);}, 250);

	useKeypress(['/'], () => {
		setTimeout(() => {
			queryElement.current?.select();
		}, 0);
	});

	function clearQuery() {
		setQuery('');
		queryElement.current.value = '';
	}

	return <div className={'relative flex items-center'}>
		<Input
			_ref={queryElement}
			type={'text'}
			placeholder={'/ Filter by name'}
			defaultValue={query}
			onChange={(e: ChangeEvent) => {debounceQuery((e.target as HTMLInputElement)?.value);}} 
			className={`
			sm:w-72 h-10 px-3 leading-tight border outline-none
			bg-secondary-300 border-transparent text-primary-900
			dark:bg-secondary-900/80 dark:border-secondary-800 dark:text-primary-200
			focus:border-selected-400 focus:dark:border-selected-600 focus:ring-0
			${className}`} />
		{query && <SmallIconButton icon={BsX} onClick={clearQuery} className={'absolute right-2'} />}
	</div>;
}
