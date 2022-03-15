import React from 'react';
import {useFilter} from './useFilter';
import Tile from './Tile';
import {useNavigate} from 'react-router-dom';

export default function List() {
	const navigate = useNavigate();
	const {filter} = useFilter();

	return <div className={'vaults-list'}>
		{filter.map(vault => {
			return <Tile key={vault.address} vault={vault} onClick={() => {navigate(`/vault/${vault.address}`);}}></Tile>;
		})}
	</div>;
}