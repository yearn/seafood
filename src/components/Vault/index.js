import React, {useEffect, useMemo} from 'react';
import {useLocation} from 'react-router-dom';
import VaultProvider, {useVault} from './VaultProvider';
import Header from './Header';
import Summary from './Summary';
import Strategy from './Strategy';
import {useBlocks} from '../../context/useSimulator/BlocksProvider';
import {useSimulator} from '../../context/useSimulator';
import Spinner from '../controls/Spinner';
import Events from './Events';
import EmptySlot from './EmptySlot';
import {useChrome} from '../Chrome';

function Layout() {
	const location = useLocation();
	const {setDialog} = useChrome();
	const {loading, vault, token} = useVault();
	const {blocks} = useBlocks();
	const {results: simulatorResults} = useSimulator();

	const queue = useMemo(() => {
		if(!vault) return [];
		const result = Array(20).fill(null).map((empty, index) => {
			return vault.withdrawalQueue.length >= index
				? vault.withdrawalQueue[index]
				: empty;
		});
		return result;
	}, [vault]);

	useEffect(() => {
		if(location.hash.startsWith('#harvest-events')) setDialog({
			component: Events, 
			args: {vault, token, simulatorResults}
		});
	}, [location, setDialog, blocks, vault, token, simulatorResults]);

	if(loading) return <div className={`
		absolute w-full h-screen flex items-center justify-center`}>
		<Spinner />
	</div>;

	return <div>
		<Header />
		<div className={'grid grid-cols-1 sm:grid-cols-2 2xl:pr-32 2xl:pl-6'}>
			<Summary className={'sm:sticky sm:top-[120px] sm:z-0'} />
			<div className={`flex flex-col gap-2 
				sm:px-4 sm:pr-12 sm:pl-8 pb-20`}>
				{queue.map((strategy, index) => <div key={index}>
					{strategy && <Strategy index={index} strategy={strategy} />}
					{!strategy && <EmptySlot index={index} />}
				</div>)}
			</div>
		</div>
	</div>;
}

export default function Vault() {
	return <VaultProvider>
		<Layout></Layout>
	</VaultProvider>;
}
