import React, {useEffect} from 'react';
import List from './List';
import Filter from './Filter';
import {useChrome} from '../Chrome';
import {usePowertools} from '../Powertools';

export default function Vaults() {
	const {overpassClassName} = useChrome();
	const {setLeftPanelKey, setLeftPanel} = usePowertools();

	useEffect(() => {
		setLeftPanelKey('vaults-filter');
		setLeftPanel(<Filter />);
	}, [setLeftPanelKey, setLeftPanel]);

	return <>
		<div className={'sm:hidden w-full flex flex-col'}>
			<div className={`sticky top-0 z-10 
				w-full h-full px-3 flex items-center justify-between gap-3
				${overpassClassName}`}>
				<Filter />
			</div>
			<List />
		</div>
		<div className={'hidden w-full sm:flex sm:flex-col'}>
			<List />
		</div>
	</>;
}