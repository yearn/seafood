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
		const yDelta = Math.abs(currPos.y - prevPos.y);
		if(currPos.y > -16) {
			setShow(true);
			setEffectClass('');
		} else if(currPos.y > -118) {
			setShow(true);
		} else if((currPos.y > prevPos.y) != show && yDelta <= 118) {
			if(show && !mediumBreakpoint) setEffectClass(hideScrollOverpassClassName);
			if(!show) setEffectClass('');
			setShow(show => !show);
		} else if(yDelta > 118) {
			setShow(true);
		}
	}, [show]);

	return <>
		<header className={`
			fixed z-50 top-0 left-0 p-4 flex flex-col
			bg-transparent dark:bg-transparent
			${effectClass}`}>
			<SmallScreen>
				<button onClick={() => navigate('#menu')} 
					className={'m-0 p-0 text-4xl bg-transparent shadow-none w-1/5'}>
					<BsList className={'fill-secondary-900 dark:fill-secondary-200'} />
				</button>
			</SmallScreen>
			<BiggerThanSmallScreen>
				<div className={`fixed top-0 left-0 w-14 h-full
					flex flex-col items-center justify-between sm:justify-start
					bg-secondary-100/60 dark:bg-black/60`}>
					<Menu></Menu>
				</div>
			</BiggerThanSmallScreen>
		</header>
		<SmallScreen>
			<Menu action={(location.hash === '#menu') ? 'show' : 'hide'}></Menu>
		</SmallScreen>
	</>;
}