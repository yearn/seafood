import React from 'react';
import {Link, useMatch, useResolvedPath} from 'react-router-dom';
import {BsBrightnessHigh, BsMoonFill} from 'react-icons/bs';
import {useApp} from '../../context/useApp';
import {SmallScreen, useMediumBreakpoint} from '../../utils/breakpoints';
import CloseDialog from '../CloseDialog';
import './index.css';

function NavigationLink({to, label}) {
	const resolved = useResolvedPath(to);
	const mediumBreakpoint = useMediumBreakpoint();
	const match = useMatch({path: resolved.pathname, end: true});
	return <Link className={match ? 'selected' : ''} to={to} replace={!mediumBreakpoint}>{label}</Link>;
}

export default function Menu({action}) {
	const {darkMode, setDarkMode} = useApp();

	return <nav className={`menu ${action ? `menu-${action}` : ''}`}>
		<SmallScreen>
			<CloseDialog></CloseDialog>
		</SmallScreen>
		<ul>
			<SmallScreen>
				<li className={'brand'}>
					{'Seafood'}
				</li>
			</SmallScreen>
			<li>
				<NavigationLink to={'/'} label={'Vaults'}></NavigationLink>
			</li>
			<li>
				<NavigationLink to={'/masterchef'} label={'Masterchef'}></NavigationLink>
			</li>
			<li>
				<NavigationLink to={'/solidly'} label={'Solidly'}></NavigationLink>
			</li>
			<li>
				<NavigationLink to={'/sandbox'} label={'Sandbox'}></NavigationLink>
			</li>
			<li>
				<NavigationLink to={'/settings'} label={'Settings'}></NavigationLink>
			</li>
			<li>
				<div onClick={() => {setDarkMode(!darkMode);}}>
					{darkMode ? <BsBrightnessHigh /> : <BsMoonFill />}
				</div>
			</li>
		</ul>
	</nav>;
}