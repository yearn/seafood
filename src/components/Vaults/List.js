import React from 'react';
import {useVaults} from '../../context/useVaults';
import {useFilter} from './useFilter';
import {useNavigate} from 'react-router-dom';
import {VaultTile} from '../tiles';
import Spinner from '../controls/Spinner';

export default function List() {
	const navigate = useNavigate();
	const {loading} = useVaults();
	const {filter, queryRe} = useFilter();

	return <>
		{loading && filter.length === 0 && <div className={`
			absolute w-full h-screen flex items-center justify-center`}>
			<Spinner />
		</div>}

		{filter.length > 0 && <div className={`
			max-w-full p-2 sm:p-4 
			grid grid-flow-row gap-2 grid-cols-1 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4`}>
			{filter.map(vault => {
				return <VaultTile key={vault.address} vault={vault} queryRe={queryRe} onClick={(event) => {
					if (event.ctrlKey || event.shiftKey || event.metaKey) {
						window.open(`/vault/${vault.address}`, '_blank');
					}else{
						navigate(`/vault/${vault.address}`);
					}
				}} />;
			})}
		</div>}
	</>;
}