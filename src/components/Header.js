import React, {useState} from 'react';
import {useScrollPosition} from '@n8tb1t/use-scroll-position';
import {BsList} from 'react-icons/bs';
import {useLocation, useNavigate} from 'react-router-dom';
import {BiggerThanSmallScreen, SmallScreen, useMediumBreakpoint} from '../utils/breakpoints';
import useScrollOverpass from '../context/useScrollOverpass';
import Menu from './Menu';

export default function Header() {
	const navigate = useNavigate();
	const location = useLocation();
	const mediumBreakpoint = useMediumBreakpoint();
	const [show, setShow] = useState(false);
	const [effectClass, setEffectClass] = useState('');
	const {hideClassName: hideScrollOverpassClassName} = useScrollOverpass();

	useScrollPosition(({prevPos, currPos}) => {
		if(currPos.y > -16) {
			setShow(true);
			setEffectClass('');
		}else if(currPos.y > -118) {
			setShow(true);
		}else if((currPos.y > prevPos.y) != show) {
			setShow(show => {return !show;});
			if(show && !mediumBreakpoint) setEffectClass(hideScrollOverpassClassName);
			if(!show) setEffectClass('');
		}
	}, [show]);

	return <>
		<header className={`
			fixed z-50 top-0 p-4 flex flex-col
			bg-transparent dark:bg-transparent
			sm:static sm:h-[64px] sm:flex-row sm:justify-between
			${!mediumBreakpoint ? effectClass : ''}`}>
			<SmallScreen>
				<button onClick={() => navigate('#menu')} className={'m-0 p-0 text-4xl bg-transparent shadow-none w-1/5'}>
					<BsList className={'fill-secondary-600'} />
				</button>
			</SmallScreen>
			<BiggerThanSmallScreen>
				<div className={'w-full pl-4 pr-8 flex items-center justify-between'}>
					<h1 onClick={() => {if(location.pathname !== '/') navigate('/');}} className={'text-5xl font-bold rainbow-text drop-shadow dark:drop-shadow-md cursor-pointer'}>{'Seafood'}</h1>
					<Menu></Menu>
				</div>
			</BiggerThanSmallScreen>
		</header>
		<SmallScreen>
			<Menu show={(location.hash === '#menu') ? 'show' : 'hide'}></Menu>
		</SmallScreen>
	</>;
}