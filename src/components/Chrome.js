import React from 'react';
import {useLocation} from 'react-router-dom';
import {useApp} from '../context/useApp';
import MainNavigation from './layout/MainNavigation';

export default function Chrome({children}) {
	const location = useLocation();
	const {darkMode} = useApp();
	const lander = location.pathname.length == 1;

	return <div className={(darkMode ? 'dark' : '') + ' max-w-full'}>
		<div className={'bg'}></div>
		<div className={'absolute z-10 w-full'}>
			{!lander > 1 && <MainNavigation />}
			<div className={`${lander ? '' : 'p-4'}`}>{children}</div>
		</div>
	</div>;
}
