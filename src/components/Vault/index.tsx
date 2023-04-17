import React, {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import VaultProvider, {useVault} from './VaultProvider';
import Tabs from './Tabs';
import {useBlocks} from '../../context/useSimulator/BlocksProvider';
import {useSimulator} from '../../context/useSimulator';
import Spinner from '../controls/Spinner';
import Events from './Events';
import {useChrome} from '../Chrome';
import {useMediumBreakpoint} from '../../utils/breakpoints';
import StrategiesTab from './StrategiesTab';
import Chips from './Chips';
import Name from './Name';
import {usePowertools} from '../Powertools';

function Layout() {
	const location = useLocation();
	const {setDialog, scrollToTop, overpassClassName} = useChrome();
	const {vault} = useVault();
	const {blocks} = useBlocks();
	const {results: simulatorResults} = useSimulator();
	const mediumBreakpoint = useMediumBreakpoint();
	const {setLeftPanel} = usePowertools();

	useEffect(() => {
		if(!(mediumBreakpoint && vault)) return;
		setLeftPanel(<Name vault={vault} className={'pl-20 pr-24'} />);
	}, [mediumBreakpoint, vault, setLeftPanel]);

	useEffect(() => {
		scrollToTop();
	}, [vault, scrollToTop]);

	useEffect(() => {
		if(location.hash.startsWith('#harvest-events')) setDialog({
			Component: Events,
			args: {vault, simulatorResults}
		});
	}, [location, setDialog, blocks, vault, simulatorResults]);

	if(!vault) return <div className={`
		fixed inset-0 w-full h-screen flex items-center justify-center`}>
		<Spinner />
	</div>;

	if(mediumBreakpoint) return <div className={'relative w-full'}>
		<div className={'px-8 flex items-start gap-3'}>
			<div className={'fixed pl-20 pt-4 pr-24 w-1/2'}>
				<Chips vault={vault} />
				<Tabs className={'mt-6'} />
			</div>
			<div className={'w-1/2'}></div>
			<div className={'w-1/2'}>
				<StrategiesTab vault={vault} />
			</div>
		</div>
	</div>;

	return <div className={'w-full'}>
		<div className={`
			sticky top-0 z-10 px-4 py-3 flex flex-col gap-3
			${overpassClassName}`}>
			<Name vault={vault} />
			<Chips vault={vault} />
		</div>
		<div className={'py-2'}>
			<Tabs />
		</div>
	</div>;
}

export default function Vault() {
	return <VaultProvider>
		<Layout></Layout>
	</VaultProvider>;
}
