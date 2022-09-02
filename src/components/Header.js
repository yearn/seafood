import React, {useState} from 'react';
import {useScrollPosition} from '@n8tb1t/use-scroll-position';
import {BsList} from 'react-icons/bs';
import {useLocation, useNavigate} from 'react-router-dom';
import {BiggerThanSmallScreen, SmallScreen, useMediumBreakpoint} from '../utils/breakpoints';
import useScrollOverpass from '../context/useScrollOverpass';
import Menu from './Menu';
import Wordmark from './Wordmark';

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
			setEffectClass('xyz');
		}
	}, [show]);

	return <>
		<header className={`
			fixed z-50 top-0 p-4 flex flex-col
			bg-transparent dark:bg-transparent
			sm:static sm:h-[64px] sm:flex-row sm:justify-between
			${effectClass}`}>
			<SmallScreen>
				<button onClick={() => navigate('#menu')} 
					className={'m-0 p-0 text-4xl bg-transparent shadow-none w-1/5'}>
					<BsList className={'fill-secondary-900 dark:fill-secondary-200'} />
				</button>
			</SmallScreen>
			<BiggerThanSmallScreen>
				<div className={'w-full pr-8 flex items-center justify-between'}>
					<Wordmark
						onClick={() => {if(location.pathname !== '/') navigate('/');}}
						className={'pl-1 text-[2.5rem] drop-shadow dark:drop-shadow-md cursor-pointer'} />
					<Menu></Menu>
				</div>
			</BiggerThanSmallScreen>
		</header>
		<SmallScreen>
			<Menu action={(location.hash === '#menu') ? 'show' : 'hide'}></Menu>
		</SmallScreen>
	</>;
}