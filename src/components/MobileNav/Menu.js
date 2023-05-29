import React from 'react';
import {Link, matchRoutes, useLocation} from 'react-router-dom';
import CloseDialog from '../controls/Dialog/Close';
import Sync from './Sync';
import Wordmark from '../Wordmark';
import Profile from './Profile';

function MenuItem({className, children}) {
	return <li className={`
		mt-8 flex items-center justify-center text-xl
		${className}`}>{children}</li>;
}

function MenuLink({to, label, altPathPatterns = []}) {
	const location = useLocation();
	const match = matchRoutes(
		[to, ...altPathPatterns].map(pattern => ({path: pattern})),
		location.pathname);

	return <Link to={to} replace={true} className={`
		no-underline px-4 py-2
		hover:bg-selected-300 hover:text-selected-900
		hover:dark:bg-selected-600 hover:dark:text-white
		cursor-pointer
		${match ? 'bg-selected-100 dark:bg-primary-600/20' : ''}`}>{label}</Link>;
}

export default function Menu({action}) {
	return <nav className={`
		fixed z-50 top-0
		w-full h-screen p-8
		flex flex-col items-center justify-center
		bg-secondary-100 dark:bg-black
		pointer-events-none

		${action && action === 'show'
		? 'opacity-100 animate-slide-in-x pointer-events-auto' 
		: 'opacity-0 animate-slide-out-x'}`}>
		<CloseDialog></CloseDialog>
		<ul className={'flex flex-col items-center justify-center'}>
			<MenuItem>
				<Wordmark className={'text-4xl'} />
			</MenuItem>
			<MenuItem>
				<Sync />
			</MenuItem>
			<MenuItem />
			<MenuItem>
				<MenuLink to={'/'} label={'Vaults'} altPathPatterns={['/vault/:address']}></MenuLink>
			</MenuItem>
			<MenuItem>
				<MenuLink to={'/risk'} label={'Risk'} altPathPatterns={['/risk/:group']}></MenuLink>
			</MenuItem>
			<MenuItem />
			<MenuItem>
				<Profile />
			</MenuItem>
		</ul>
	</nav>;
}