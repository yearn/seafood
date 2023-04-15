import React, {ReactNode, useMemo, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {Link, matchRoutes, useLocation} from 'react-router-dom';
import Wordmark from './Wordmark';
import Icon from './Icon';
import {A} from './controls';
import Starfield from './Starfield';
import {useVaultStatusUI} from './Sync';
import {useVaults} from '../context/useVaults';
import Lux from './Lux';
import {useAuth} from '../context/useAuth';

interface LinkInfo {
	to?: string,
	onClick?: () => void
	label: ReactNode,
	altPathPatterns?: string[]
}

function useMatchRoutes(link: LinkInfo) {
	const location = useLocation();
	const match = matchRoutes(
		[link.to, ...(link.altPathPatterns || [])].map(pattern => ({path: pattern})),
		location.pathname);
	return match;
}

function Light({link}: {link: LinkInfo}) {
	const on = useMatchRoutes(link);
	return <div className={'h-[40px] flex items-center justify-center'}>
		<div className={`w-1 h-1 ${on ? 'bg-primary-600 dark:bg-primary-400' : 'bg-primary-600/40 dark:bg-primary-400/40'}`}></div>
	</div>;
}

function StatusLight() {
	const {loading, refresh} = useVaults();
	const {colors} = useVaultStatusUI();

	if(loading) {
		return <div className={`
			h-[40px] flex items-center justify-center`}>
			<div className={`
				absolute h-2 w-2
				opacity-75 animate-ping
				${colors.bg}`} />
			<div className={`
				h-1 w-1 m-1
				${colors.bg}`} />
		</div>;
	}

	return <div onClick={refresh} className={'h-[40px] flex items-center justify-center cursor-pointer'}>
		<div className={`h-1 w-1 ${colors.bg}`}></div>
	</div>;
}

function LoginLight() {
	const {profile} = useAuth();
	return <div className={'h-[40px] flex items-center justify-center'}>
		<div className={`w-1 h-1 ${profile ? 'bg-primary-600 dark:bg-primary-400' : 'bg-primary-600/40 dark:bg-primary-400/40'}`}></div>
	</div>;
}

function MenuItem({className, children}: {className?: string, children: ReactNode}) {
	return <li className={`h-[40px] flex items-center
		${className}`}>{children}</li>;
}

function MenuLink({link, className}: {link: LinkInfo, className?: string}) {
	const match = useMatchRoutes(link);
	const classNames = useMemo(() => {
		return `
			w-full h-full flex items-center no-underline px-4
			hover:bg-selected-300 hover:text-selected-900
			hover:dark:bg-selected-600 hover:dark:text-white
			cursor-pointer
			${match ? 'bg-white dark:bg-primary-600/20' : ''}
			${className}`;
	}, [match, className]);

	if(link.to) {
		return <Link to={link.to} className={classNames}>{link.label}</Link>;
	} else if(link.onClick) {
		return <div onClick={link.onClick} className={classNames}>{link.label}</div>;
	} else {
		throw '!(link.to || link.onClick)';
	}
}

export default function Powerstrip({className}: {className?: string}) {
	const [hover, setHover] = useState(false);
	const syncStatus = useVaultStatusUI();
	const {profile, login, logout} = useAuth();
	const links = [
		{to: '/status', label: 'Status', altPathPatterns: []},
		{to: '/', label: 'Vaults', altPathPatterns: ['/vault/:address']},
		{to: '/risk', label: 'Risk', altPathPatterns: ['/risk/:group']},
		{
			onClick: profile ? logout : login,
			label: !profile ? 'Login with Github' : <div className={'relative w-full flex items-center justify-between'}>
				{'Logout'}
				<img className={'w-8 h-8 -m-2'}
					src={profile.avatar_url} 
					alt={'avatar'} />
			</div>
		}
	] as LinkInfo[];

	const Lights = [
		<StatusLight key={0} />,
		<Light key={1} link={links[1]} />,
		<Light key={2} link={links[2]} />,
		<LoginLight key={3} />
	];
	
	const MenuLinks = [
		<MenuItem key={0}>
			<MenuLink 
				link={{...links[0], label: syncStatus.message}} 
				className={`text-xs ${syncStatus.hasErrors ? syncStatus.colors.text : ''}`} />
		</MenuItem>,
		<MenuItem key={1}><MenuLink link={links[1]} /></MenuItem>,
		<MenuItem key={2}><MenuLink link={links[2]} /></MenuItem>,
		<MenuItem key={3}>
			<MenuLink link={{...links[3]}} />
		</MenuItem>
	];

	return <div 
		onMouseOver={() => setHover(true)}
		onMouseOut={() => setHover(false)}
		className={`
		bg-secondary-100 dark:bg-black
		${className}`}>
		<div className={'z-10 pt-6 flex flex-col items-center justify-center gap-2'}>
			{Lights.map(light => light)}
		</div>

		<div key={'powerstrip-hoverpad'} className={'fixed top-0 left-6 w-6 h-full'} />

		<AnimatePresence>
			{hover && <motion.div key={'powerstrip-menu'}
				transition={{type: 'spring', stiffness: 800, damping: 32}}
				initial={{x: -6}}
				animate={{x: 0}}
				exit={{x: -10, opacity: 0}}
				className={`
				fixed top-0 left-6 
				w-48 h-full`}>
				<div className={`
					absolute z-[0] top-0 right-0 w-[50%] h-full 
					bg-secondary-100 dark:bg-black drop-shadow-lg`}></div>
				<div className={`
					absolute z-[10] top-0 left-0
					w-full h-full pt-6 pr-3 pb-12
					flex flex-col justify-between
					bg-secondary-100 dark:bg-black`}>
					<div className={'flex flex-col gap-2'}>
						{MenuLinks.map(link => link)}
					</div>
					<div className={'pr-3 flex flex-col items-center justify-center'}>
						<Lux className={'mb-16 p-4'} />
						<div className={'relative w-[80%] h-16 flex items-start justify-end'}>
							<Starfield className={'absolute z-1 inset'} />
							<Icon className={'absolute z-10 w-1/4 top-1 right-2'} fill={'black'} />
						</div>
						<Wordmark className={'text-3xl'} />
						<div className={'flex items-center gap-3'}>
							<A href={'https://github.com/yearn/seafood'}
								title={'https://github.com/yearn/seafood'}
								target={'_blank'}
								rel={'noreferrer'}
								className={'text-xs'}>
								{'github'}
							</A>
							<A href={'https://discord.yearn.finance'}
								title={'https://discord.yearn.finance'}
								target={'_blank'}
								rel={'noreferrer'}
								className={'text-xs'}>
								{'discord'}
							</A>
							<A href={'https://twitter.com/iearnfinance'}
								title={'https://twitter.com/iearnfinance'}
								target={'_blank'}
								rel={'noreferrer'}
								className={'text-xs'}>
								{'twitter'}
							</A>
						</div>
					</div>
				</div>
			</motion.div>}
		</AnimatePresence>
	</div>;
}
