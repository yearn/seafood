import React from 'react';
import {Link, matchRoutes, useLocation} from 'react-router-dom';
import {SmallScreen, useMediumBreakpoint} from '../utils/breakpoints';
import CloseDialog from './controls/Dialog/Close';
import Sync from './Sync';
import Wordmark from './Wordmark';
import Profile from './Profile';

function MenuItem({className, children}) {
	return <li className={`
		mt-8 flex items-center justify-center text-xl
		sm:mt-0 sm:ml-2 sm:text-base
		lg:ml-8
		${className}`}>{children}</li>;
}

function MenuLink({to, label, altPathPatterns = []}) {
	const mediumBreakpoint = useMediumBreakpoint();
	const location = useLocation();
	const match = matchRoutes(
		[to, ...altPathPatterns].map(pattern => ({path: pattern})),
		location.pathname);

	return <Link to={to} replace={!mediumBreakpoint} className={`
		no-underline px-4 py-2 rounded-lg
		hover:bg-selected-300 hover:text-selected-900
		hover:dark:bg-selected-600 hover:dark:text-white
		active:transform active:scale-95
		transition duration-200
		cursor-pointer
		${match ? 'bg-selected-100 dark:bg-primary-600/20' : ''}`}>{label}</Link>;
}

export default function Menu({action}) {
	const mediumBreakpoint = useMediumBreakpoint();

	return <nav className={`
		fixed z-50 top-0
		w-full h-screen p-8
		flex flex-col items-center justify-center
		bg-secondary-100 dark:bg-secondary-900
		pointer-events-none

		sm:static sm:w-fit sm:h-auto sm:p-0
		sm:flex-row
		sm:bg-transparent sm:dark:bg-transparent
		sm:opacity-100 sm:pointer-events-auto
		${!mediumBreakpoint 
		? action && action === 'show'
			? 'opacity-100 animate-slide-in-x pointer-events-auto' 
			: 'opacity-0 animate-slide-out-x'
		: ''}`}>
		<SmallScreen>
			<CloseDialog></CloseDialog>
		</SmallScreen>
		<ul className={'flex flex-col sm:flex-row items-center justify-center'}>
			<SmallScreen>
				<MenuItem>
					<Wordmark className={'text-4xl'} />
				</MenuItem>
			</SmallScreen>
			<MenuItem>
				<Sync />
			</MenuItem>
			<MenuItem />
			<MenuItem>
				<MenuLink to={'/'} label={'Vaults'} altPathPatterns={['/vault/:address']}></MenuLink>
			</MenuItem>
			<MenuItem>
				<MenuLink to={'/sandbox'} label={'Sandbox'}></MenuLink>
			</MenuItem>
			<SmallScreen>
				<MenuItem />
			</SmallScreen>
			<MenuItem>
				<Profile />
			</MenuItem>
		</ul>
	</nav>;
}