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
		<div onClick={onClick('')} className={`lg-circle-icon-button sandbox-tab ${location.hash === '' ? 'selected' : ''}`}><BsBox></BsBox></div>
		<div onClick={onClick('run')} className={`lg-circle-icon-button sandbox-tab ${location.hash === '#run' ? 'selected' : ''}`}><BsPlay></BsPlay></div>
		<div onClick={onClick('code')} className={`lg-circle-icon-button sandbox-tab ${location.hash === '#code' ? 'selected' : ''}`}><BsCode></BsCode></div>
	</div>;
}