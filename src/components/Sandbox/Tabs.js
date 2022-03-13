import React from 'react';
import {BsBox, BsCode} from 'react-icons/bs';
import {useLocation, useNavigate} from 'react-router-dom';
import useScrollOverpass from '../Header/useScrollOverpass';

export default function Tabs() {
	const location = useLocation();
	const navigate = useNavigate();
	const {overpassClass} = useScrollOverpass();

	const onClick = hash => {
		return () => {
			navigate(`${location.pathname}#${hash}`);
		};
	};

	return <div className={`tabs ${overpassClass}`}>
		<div className={'basis-1/3'}></div>
		<div onClick={onClick('')} className={`tab basis-1/3 justify-center ${location.hash === '' ? 'selected' : ''}`}><BsBox></BsBox></div>
		<div onClick={onClick('code')} className={`tab basis-1/3 justify-end pr-1 ${location.hash === '#code' ? 'selected' : ''}`}><BsCode></BsCode></div>
	</div>;
}