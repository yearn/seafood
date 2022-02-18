import React from 'react';
import {Link} from 'react-router-dom';
import classes from './MainNavigation.module.css';

function MainNavigation(){
	return <header className={classes.header}>
		
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