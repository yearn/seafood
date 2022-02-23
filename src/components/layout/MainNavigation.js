import React, {useState,useEffect} from 'react';
import {Link, useMatch, useResolvedPath} from 'react-router-dom';
import {GetCurrentBlock} from '../../ethereum/EthHelpers';

import useRPCProvider from '../../context/useRpcProvider';
import {BsBrightnessHigh, BsMoonFill} from 'react-icons/bs';
import {useApp} from '../../context/useApp';

function NavigationLink({to, label}) {
	let resolved = useResolvedPath(to);
	let match = useMatch({path: resolved.pathname, end: true});
	return <Link className={match ? 'selected' : ''} to={to}>{label}</Link>;
}

function MainNavigation(){
	const {darkMode, setDarkMode} = useApp();
	const [alert, setAlert] = useState(null);
	const {defaultProvider, fantomProvider} = useRPCProvider();

	useEffect(() => {
		GetCurrentBlock(defaultProvider).then(b => {
			if(Date.now()/1000 - b.timestamp > 360){
				setAlert('ETH block is late ' + Math.floor((Date.now()/1000 - b.timestamp)/60) + ' minutes');
			}
		});
		GetCurrentBlock(fantomProvider).then(b => {
			if(Date.now()/1000 - b.timestamp > 360){
				setAlert('FTM block is late ' + Math.floor((Date.now()/1000 - b.timestamp)/60) + ' minutes');
			}
		});
	}, []);

	return <header>
		<div className={'alert'}>{alert}</div>
		<nav>
			<ul>
				<li>
					<NavigationLink to={'/'} label={'All Vaults'}></NavigationLink>
				</li>
				<li>
					<NavigationLink to={'/masterchef'} label={'Masterchef'}></NavigationLink>
				</li>
				<li>
					<NavigationLink to={'/sandbox'} label={'Sandbox'}></NavigationLink>
				</li>
				<li>
					<NavigationLink to={'/settings'} label={'Settings'}></NavigationLink>
				</li>
				<li>
					<div onClick={() => { setDarkMode(!darkMode); }}>
						{darkMode ? <BsBrightnessHigh /> : <BsMoonFill />}
					</div>
				</li>
			</ul>
		</nav>
	</header>;
}

export default MainNavigation;