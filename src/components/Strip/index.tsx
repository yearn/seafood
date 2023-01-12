import React from 'react';
import Sync from '../Sync';

function Dot({color}: {color: string}) {
	return <li className={'flex justify-end'}>
		<div className={`
		rounded-full h-1 w-1 bg-${color}`} />
	</li>;
}

export default function Strip() {
	return <nav className={`
		fixed z-50 top-0
		w-full h-screen p-8
		flex flex-col items-end justify-center gap-3
		bg-secondary-100 dark:bg-black
		pointer-events-none

		sm:static sm:p-0 sm:pt-1 sm:justify-between
		sm:dark:bg-indigo-900
		sm:opacity-100 sm:pointer-events-auto`}>
		<ul className={'pt-5 flex flex-col gap-8'}>
			<li>
				<Sync expand={false} />
			</li>
			<Dot color={'primary-800'} />
			<Dot color={'primary-400'} />
			<Dot color={'primary-800'} />
			<Dot color={'primary-800'} />
		</ul>
	</nav>;
}