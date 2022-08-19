import React from 'react';
import VaultProvider, {useVault} from './VaultProvider';
import Summary from './Summary';
import Toolbar from './Toolbar';
import Strategy from './Strategy';
import SimulatorProvider from './SimulatorProvider';
import {useLocation} from 'react-router-dom';
import Code from './Code';

function Layout() {
	const location = useLocation();
	const {loading, vault} = useVault();

	if(loading) return <div className={`
		w-full h-screen flex items-center justify-center rainbow-text`}>
		{'Loading..'}
	</div>;

	return <div>
		{location.hash === '' && <>
			<Summary />
			<div className={'flex flex-col gap-2 pb-20'}>
				{vault.strats_detailed.map((strategy, index) => 
					<Strategy key={index} strategy={strategy} />
				)}
			</div>
			<Toolbar />
		</>}
		{location.hash === '#code' && <div className={'absolute inset-0 pt-16'}>
			<Code />
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