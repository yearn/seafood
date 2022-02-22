import React, {useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {GetCurrentBlock} from '../../ethereum/EthHelpers';

import useRPCProvider from '../../context/useRpcProvider';
import classes from './MainNavigation.module.css';

function MainNavigation(){

	let [alert, setAlert] = useState(null);
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
	});

	const {defaultProvider, fantomProvider} = useRPCProvider();
	return <header className={classes.header}>

		<span>{alert}</span>
		<nav>
			<ul>
				<li>
					<Link to={'/'}>{'All Vaults'}</Link>
				</li>
				<li>
					<Link to={'/masterchef'}>{'Masterchef'}</Link>
				</li>
				<li>
					<Link to={'/sandbox'}>{'Sandbox'}</Link>
				</li>
				<li>
					<Link to={'/settings'}>{'Settings'}</Link>
				</li>
			</ul>
		</nav>
	</header>;
}

export default MainNavigation;