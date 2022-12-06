import React, {useState} from 'react';
import {Link, matchRoutes, useLocation} from 'react-router-dom';
import {SmallScreen, useMediumBreakpoint} from '../../utils/breakpoints';
import CloseDialog from '../controls/Dialog/Close';
import Sync from '../Sync';
import Wordmark from '../Wordmark';
import Profile from './Profile';
import {BsSafe} from 'react-icons/bs';
import {AiOutlineCodeSandbox} from 'react-icons/ai';
import {IoFishOutline} from 'react-icons/io5';
import Lux from './Lux';

const buttonClassName = `
w-10 h-10 flex items-center justify-center
no-underline rounded-md
text-primary-900 dark:text-primary-50
hover:bg-selected-300 hover:dark:bg-selected-600 hover:dark:text-primary-50
active:transform active:scale-95
transition duration-200
cursor-pointer`;

function MenuItem({className, children}) {
	return <li className={`
		mt-8 flex items-center justify-center text-xl
		sm:mt-0 sm:text-base
		${className}`}>{children}</li>;
}

function MenuLink({to, label, icon, expand, altPathPatterns = []}) {
	const mediumBreakpoint = useMediumBreakpoint();
	const location = useLocation();
	const match = matchRoutes(
		[to, ...altPathPatterns].map(pattern => ({path: pattern})),
		location.pathname);

	return <Link title={label} to={to} replace={!mediumBreakpoint} className={`
		${buttonClassName}
		${match ? 'bg-selected-100 dark:bg-primary-600/20' : ''}`}>
		{icon && icon({className: 'text-4xl sm:text-xl'})}
		{expand && label}
	</Link>;
}

export default function Menu({action}) {
	const [expand] = useState(false);
	const mediumBreakpoint = useMediumBreakpoint();

	return <nav className={`
		fixed z-50 top-0
		w-full h-screen p-8
		flex flex-col items-center justify-center gap-3
		bg-secondary-100 dark:bg-secondary-900
		pointer-events-none

		sm:static sm:p-0 sm:pt-1 sm:justify-between
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
		<ul className={'pt-1'}>
			<MenuItem>
				<Profile className={buttonClassName} />
			</MenuItem>
		</ul>
		<ul className={'flex flex-col items-center justify-center sm:gap-3'}>
			<SmallScreen>
				<MenuItem>
					<Wordmark className={'text-4xl'} />
				</MenuItem>
			</SmallScreen>
			<MenuItem>
				<MenuLink to={'/'} label={'Vaults'} icon={BsSafe} altPathPatterns={['/vault/:address']}></MenuLink>
			</MenuItem>
			<MenuItem>
				<MenuLink to={'/sandbox'} label={'Sandbox'} icon={AiOutlineCodeSandbox}></MenuLink>
			</MenuItem>
			<MenuItem>
				<MenuLink to={'/about'} label={'About Seafood'} icon={IoFishOutline}></MenuLink>
			</MenuItem>
		</ul>
		<ul className={'sm:pb-8 flex flex-col items-center justify-center sm:gap-3'}>
			<MenuItem>
				<Lux className={buttonClassName} />
			</MenuItem>
			<MenuItem className={'pt-3 mb-8'}>
				<Sync expand={expand} />
			</MenuItem>
		</ul>
	</nav>;
}