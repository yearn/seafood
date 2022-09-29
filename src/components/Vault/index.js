import React from 'react';
import VaultProvider, {useVault} from './VaultProvider';
import Summary from './Summary';
import Toolbar from './Toolbar';
import Strategy from './Strategy';
import SimulatorProvider from './SimulatorProvider';
import {useLocation} from 'react-router-dom';
import Code from './Code';
import Loading from '../Loading';
import Events from './Events';

function Layout() {
	const location = useLocation();
	const {loading, vault} = useVault();

	if(loading) return <div className={`
		absolute w-full h-screen flex items-center justify-center`}>
		<Loading />
	</div>;

	return <div>
		{location.hash === '' && <>
			<Summary />
			<div className={'flex flex-col gap-2 pb-20'}>
				{vault.strategies.map((strategy, index) => 
					<Strategy key={index} strategy={strategy} />
				)}
			</div>
			<Toolbar />
		</>}
		{location.hash === '#code' && <div className={'absolute inset-0 pt-16'}>
			<Code />
		</div>}
		{location.hash.startsWith('#harvest-events') && <div className={'absolute inset-0 pt-16'}>
			<Events />
		</div>}
	</div>;
}

export default function Vault() {
	return <VaultProvider>
		<SimulatorProvider>
			<Layout></Layout>
		</SimulatorProvider>
	</VaultProvider>;
}