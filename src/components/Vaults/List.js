import React from 'react';
import {useFilter} from './useFilter';
import Tile from './Tile';
import {useNavigate} from 'react-router-dom';

export default function List() {
	const navigate = useNavigate();
	const {filter, queryRe} = useFilter();

	return <div className={'vaults-list'}>
		{filter.map(vault => {
			return <Tile key={vault.address} vault={vault} queryRe={queryRe} onClick={(event) => {
				if (event.ctrlKey || event.shiftKey) {
					window.open(`/vault/${vault.address}`, '_blank');
				}else{
					navigate(`/vault/${vault.address}`);
				}
			}}></Tile>;
		})}
	</div>;
}