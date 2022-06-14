import React, {useRef} from 'react';
import {BsX} from 'react-icons/bs';
import useKeypress from 'react-use-keypress';
import {useDebouncedCallback} from 'use-debounce';
import useScrollOverpass from '../Header/useScrollOverpass';
import {BiggerThanSmallScreen, SmallScreen} from '../../utils/breakpoints';
import {useFilter} from './useFilter';
import Chips from './Chips';

export default function Filter({showVaultCount = false, overpassOnScroll = true}) {
	const queryElement = useRef();
	const {query, setQuery, filter} = useFilter();
	const debounceQuery = useDebouncedCallback(value => {setQuery(value);}, 250);
	const {overpassClass} = useScrollOverpass();

	useKeypress(['/'], () => {
		setTimeout(() => {
			queryElement.current.select();
		}, 0);
	});

	function clearQuery() {
		setQuery('');
		queryElement.current.value = '';
	}

	return <>
		<SmallScreen>
			<div className={`filter py-4 ${overpassOnScroll ? overpassClass : ''}`}>
				<div className={'flex items-center justify-between'}>
					<div className={'w-1/5'}></div>
					<div className={'w-3/5 relative flex items-center justify-center'}>
						<input ref={queryElement} onChange={(e) => {debounceQuery(e.target.value);}} defaultValue={query} type={'text'} placeholder={'/ Filter by name'} />
						{query && <div onClick={clearQuery} className={'absolute right-2 sm-circle-icon-button'}>
							<BsX />
						</div>}
					</div>
					<div className={'w-1/5 text-center text-xs'}>
						{showVaultCount && `${filter.length} Vaults`}
					</div>
				</div>
				<div className={'mt-4 flex items-center justify-center'}>
					<Chips></Chips>
				</div>
			</div>
		</SmallScreen>
		<BiggerThanSmallScreen>
			<div className={`filter pl-4 pr-8 py-2 flex items-center gap-2 ${overpassOnScroll ? overpassClass : ''}`}>
				<div className={'relative flex items-center justify-center'}>
					<input ref={queryElement} onChange={(e) => {debounceQuery(e.target.value);}} defaultValue={query} type={'text'} placeholder={'/ Filter by name'} />
					{query && <div onClick={clearQuery} className={'absolute right-2 sm-circle-icon-button'}>
						<BsX />
					</div>}
				</div>
				<div className={'w-full flex items-center justify-between'}>
					<Chips></Chips>
					<div className={'text-2xl'}>
						{showVaultCount && `${filter.length} Vaults`}
					</div>
				</div>
			</div>
		</BiggerThanSmallScreen>
	</>;
}