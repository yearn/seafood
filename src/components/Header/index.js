import React, {useState} from 'react';
import {useScrollPosition} from '@n8tb1t/use-scroll-position';
import {BsList} from 'react-icons/bs';
import {useLocation, useNavigate} from 'react-router-dom';
import {BiggerThanSmallScreen, SmallScreen, useMediumBreakpoint} from '../../utils/breakpoints';
import Menu from '../Menu';
import './index.css';

export default function Header() {
	const navigate = useNavigate();
	const location = useLocation();
	const mediumBreakpoint = useMediumBreakpoint();
	const [show, setShow] = useState(false);
	const [effectClass, setEffectClass] = useState('');

	useScrollPosition(({prevPos, currPos}) => {
		if(currPos.y > -16) {
			setShow(true);
			setEffectClass('');
		}else if(currPos.y > -118) {
			setShow(true);
		}else if((currPos.y > prevPos.y) != show) {
			setShow(show => {return !show;});
			if(show && !mediumBreakpoint) setEffectClass('scroll-overpass-hide');
			if(!show) setEffectClass('');
		}
	}, [show]);

	return <>
		<header className={`${!mediumBreakpoint ? effectClass : ''}`}>
			<SmallScreen>
				<button onClick={() => navigate('#menu')} className={'menu w-1/5'}><BsList /></button>
			</SmallScreen>
			<BiggerThanSmallScreen>
				<div className={'w-full pl-4 pr-8 flex items-center justify-between'}>
					<h1 onClick={() => {if(location.pathname !== '/') navigate('/');}} className={'text-3xl font-bold rainbow-text dark:drop-shadow-md cursor-pointer'}>{'Seafood'}</h1>
					<Menu></Menu>
				</div>
			</BiggerThanSmallScreen>
		</header>
		<SmallScreen>
			<Menu action={(location.hash === '#menu') ? 'show' : 'hide'}></Menu>
		</SmallScreen>
	</>;
}