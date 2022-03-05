import React, {useRef, useState} from 'react';
import {useScrollPosition} from '@n8tb1t/use-scroll-position';
import {BsList, BsX} from 'react-icons/bs';
import {useLocation, useNavigate} from 'react-router-dom';
import useKeypress from 'react-use-keypress';
import {useDebouncedCallback} from 'use-debounce';
import {useFilter} from './useFilter';
import {MediumScreen, SmallScreen, useMediumBreakpoint} from '../../utils/breakpoints';
import Menu from './Menu';
import Chips from './Chips';

export default function Header() {
	const navigate = useNavigate();
	const location = useLocation();
	const mediumBreakpoint = useMediumBreakpoint();
	const queryElement = useRef();
	const [show, setShow] = useState(false);
	const [effectClass, setEffectClass] = useState('');
	const {query, setQuery, filter} = useFilter();
	const debounceQuery = useDebouncedCallback(value => {setQuery(value);}, 250);

	useScrollPosition(({prevPos, currPos}) => {
		if(currPos.y > -16) {
			setShow(true);
			setEffectClass('');
		}else if(currPos.y > -118) {
			setShow(true);
			setEffectClass('vaults-overpass');
		}else if((currPos.y > prevPos.y) != show) {
			setShow(show => {return !show;});
			if(show && !mediumBreakpoint) setEffectClass('vaults-hide');
			if(!show) setEffectClass('vaults-overpass');
		}
	}, [show]);

	useKeypress(['/'], () => {
		setTimeout(() => {
			queryElement.current.focus();
		}, 0);
	});

	function clearQuery() {
		setQuery('');
		queryElement.current.value = '';
	}

	return <>
		<header className={`vaults ${!mediumBreakpoint ? effectClass : ''}`}>
			<SmallScreen>
				<div className={'flex items-center justify-between'}>
					<button onClick={() => navigate('#menu')} className={'menu w-1/6'}><BsList /></button>
					<div className={'relative flex items-center justify-center'}>
						<input ref={queryElement} onChange={(e) => {debounceQuery(e.target.value);}} defaultValue={query} type={'text'} placeholder={'/ Filter by name'} />
						{query && <div onClick={clearQuery} className={'absolute right-2 sm-circle-icon-button'}>
							<BsX />
						</div>}
					</div>
					<div className={'w-1/6 text-center text-xs'}>
						{`${filter.length} Vaults`}
					</div>
				</div>
				<div className={'mt-4 flex items-center justify-center'}>
					<Chips></Chips>
				</div>
			</SmallScreen>
			<MediumScreen>
				<div className={'w-full pl-4 pr-8 flex items-center justify-between'}>
					<h1 className={'text-3xl font-bold'}>{'Seafood'}</h1>
					<Menu></Menu>
				</div>
			</MediumScreen>
		</header>
		<SmallScreen>
			<Menu action={(location.hash === '#menu') ? 'show' : 'hide'}></Menu>
		</SmallScreen>
		<MediumScreen>
			<div className={`sticky top-0 flex items-center pl-4 pr-8 py-2 ${mediumBreakpoint ? effectClass : ''}`}>
				<div className={'relative flex items-center justify-center'}>
					<input ref={queryElement} onChange={(e) => {debounceQuery(e.target.value);}} defaultValue={query} type={'text'} placeholder={'/ Filter by name'} />
					{query && <div onClick={clearQuery} className={'absolute right-2 sm-circle-icon-button'}>
						<BsX />
					</div>}
				</div>
				<div className={'w-full flex items-center justify-between'}>
					<Chips></Chips>
					<div className={'text-2xl'}>
						{`${filter.length} Vaults`}
					</div>
				</div>
			</div>
		</MediumScreen>
	</>;
}