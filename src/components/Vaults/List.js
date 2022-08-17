import React from 'react';
import {useFilter} from './useFilter';
import {useNavigate} from 'react-router-dom';
import {VaultTile} from '../tiles';

export default function List() {
	const navigate = useNavigate();
	const {filter, queryRe} = useFilter();

	return <div className={`
		max-w-full p-2 sm:p-4 
		grid grid-flow-row gap-2 grid-cols-1 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4`}>
		{filter.map(vault => {
			return <VaultTile key={vault.address} vault={vault} queryRe={queryRe} onClick={(event) => {
				if (event.ctrlKey || event.shiftKey) {
					window.open(`/vault/${vault.address}`, '_blank');
				}else{
					navigate(`/vault/${vault.address}`);
				}
			}} />;
		})}
	</div>;
}