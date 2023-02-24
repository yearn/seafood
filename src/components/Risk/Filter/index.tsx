import React, {useMemo} from 'react';
import ScrollContainer from 'react-indiana-drag-scroll';
import Network from './Network';
import Scores from './Scores';
import Search from './Search';
import Strategies from './Strategies';
import {useVaults} from '../../../context/useVaults';
import Chip from '../../tiles/Chip';
import {useFilter} from './Provider';
import {isEthAddress} from '../../../utils/utils';

export default function Filter() {
	const {query} = useFilter();
	const {vaults} = useVaults();

	const vault = useMemo(() => {
		if(isEthAddress(query)) {
			return vaults.find(v => v.address === query);
		}
	}, [query, vaults]);

	return <div className={`
		pt-2 sm:pt-0 px-2 sm:pl-4 
		flex flex-col sm:flex-row gap-3`}>
		<Search className={'w-[72%] sm:w-44 ml-[15%] sm:ml-0'} />
		<ScrollContainer className={'w-full flex items-center gap-3'}>
			{vault && <div className={'px-4 col-span-10 flex items-center gap-2 whitespace-nowrap'}>
				{vault.name}
				<Chip label={vault.version} className={'bg-primary-400 dark:bg-primary-900'} />
				<Chip label={vault.network.name} className={`bg-${vault.network.name}`} />
			</div>}
			<Network />
			<Strategies />
			<Scores />
		</ScrollContainer>
	</div>;
}
