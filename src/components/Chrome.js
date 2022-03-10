import React from 'react';
import {useApp} from '../context/useApp';
import Header from './Header';

export default function Chrome({children}) {
	const {darkMode} = useApp();
	return <div className={(darkMode ? 'dark' : '') + ' max-w-full'}>
		<div className={'bg'}></div>
		<div className={'absolute z-10 w-full min-h-full flex flex-col'}>
			<Header></Header>
			{children}
		</div>
	</div>;
}
