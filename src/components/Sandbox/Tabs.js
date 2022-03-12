import React from 'react';
import {BsBox, BsCode, BsPlay} from 'react-icons/bs';
import {useLocation, useNavigate} from 'react-router-dom';

export default function Tabs() {
	const location = useLocation();
	const navigate = useNavigate();

	const onClick = hash => {
		return () => {
			navigate(`${location.pathname}#${hash}`);
		};
	};

	return <div className={'py-4 flex items-center justify-evenly'}>
		<div onClick={onClick('')} className={`tab lg-circle-icon-button ${location.hash === '' ? 'selected' : ''}`}><BsBox></BsBox></div>
		<div onClick={onClick('run')} className={`tab lg-circle-icon-button ${location.hash === '#run' ? 'selected' : ''}`}><BsPlay></BsPlay></div>
		<div onClick={onClick('code')} className={`tab lg-circle-icon-button ${location.hash === '#code' ? 'selected' : ''}`}><BsCode></BsCode></div>
	</div>;
}