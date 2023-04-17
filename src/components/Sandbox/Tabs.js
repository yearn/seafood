import React from 'react';
import {BsBox, BsCode} from 'react-icons/bs';
import {useLocation, useNavigate} from 'react-router-dom';
import {useChrome} from '../Chrome';

export default function Tabs() {
	const location = useLocation();
	const navigate = useNavigate();
	const {overpassClassName} = useChrome();

	const selectTab = hash => {
		return () => {
			navigate(`${location.pathname}#${hash}`);
		};
	};

	function Tab({icon, onClick, selected, className}) {
		return <div onClick={onClick} className={`flex basis-1/3 justify-center ${className}`}>
			{icon({className: selected ? 'fill-primary-400 dark:fill-secondary-100' : 'fill-secondary-600'})}
		</div>;
	}

	return <div className={`
		fixed top-0 left-0 w-full px-0 py-4 text-4xl
		flex items-center justify-between
		${overpassClassName}`}>
		<div className={'basis-1/3'}></div>
		<Tab icon={BsBox} onClick={selectTab('')} selected={location.hash === ''} />
		<Tab icon={BsCode} onClick={selectTab('code')} selected={location.hash === '#code'} className={'pl-8'} />
	</div>;
}