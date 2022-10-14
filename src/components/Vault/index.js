import React, {useEffect} from 'react';
import VaultProvider, {useVault} from './VaultProvider';
import {useChrome} from '../Chrome';
import Summary from './Summary';
import Toolbar from './Toolbar';
import Strategy from './Strategy';
import SimulatorProvider, {useSimulator} from './SimulatorProvider';
import {useLocation} from 'react-router-dom';
import Code from './Code';
import Loading from '../Loading';
import Events from './Events';

function Layout() {
	const location = useLocation();
	const {setDialog} = useChrome();
	const {loading, vault, token} = useVault();
	const {debtRatioUpdates, strategyResults} = useSimulator();

	useEffect(() => {
		if(location.hash === '#code') {
			setDialog({component: Code, args: {vault, debtRatioUpdates}});
		} else if(location.hash.startsWith('#harvest-events')) {
			setDialog({component: Events, args: {vault, token, strategyResults}});
		} else {
			setDialog(null);
		}
	}, [location, setDialog, vault, token, debtRatioUpdates, strategyResults]);

	if(loading) return <div className={`
		absolute w-full h-screen flex items-center justify-center`}>
		<Loading />
	</div>;

	return <div>
		<Summary />
		<div className={'flex flex-col gap-2 pb-20'}>
			{vault.strategies.map((strategy, index) => 
				<Strategy key={index} strategy={strategy} />
			)}
		</div>
		<Toolbar />
	</div>;
}

export default function Vault() {
	return <VaultProvider>
		<SimulatorProvider>
			<Layout></Layout>
		</SimulatorProvider>
	</VaultProvider>;
}