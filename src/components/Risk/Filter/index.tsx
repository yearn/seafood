import React, {ReactNode, useMemo} from 'react';
import ScrollContainer from 'react-indiana-drag-scroll';
import Network from './Network';
import Scores from './Scores';
import Search from './Search';
import Strategies from './Strategies';
import {useVaults} from '../../../context/useVaults';
import {useFilter} from './Provider';
import {isEthAddress} from '../../../utils/utils';

function Chip({className, children}: {className: string, children: ReactNode}) {
	return <div className={`text-sm px-2 py-1 ${className}`}>
		{children}
	</div>;
}

export default function Filter() {
	const {query} = useFilter();
	const {vaults} = useVaults();

	const vault = useMemo(() => {
		if(isEthAddress(query)) {
			return vaults.find(v => v.address === query);
		}
	}, [query, vaults]);

	return <div className={`w-full
		pt-2 sm:pt-0 px-2 sm:px-0 
		flex flex-col sm:flex-row gap-3`}>
		<Search className={''} />
		<ScrollContainer className={'w-full sm:w-min flex items-center gap-3'}>
			{vault && <div className={'px-4 col-span-10 flex items-center gap-2 whitespace-nowrap'}>
				{vault.name}
				<Chip className={`
					bg-neutral-200/40 dark:bg-neutral-800/40
					border border-neutral-200 dark:border-neutral-800
					`}>{vault.version}</Chip>
				<Chip className={`
					bg-${vault.network.name}-40
					border border-${vault.network.name}
					`}>{vault.network.name}</Chip>
			</div>}
			<Network />
			<Strategies />
			<Scores />
		</ScrollContainer>
	</div>;
}
