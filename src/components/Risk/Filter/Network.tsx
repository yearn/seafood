import React, {useCallback, useMemo} from 'react';
import FilterChip from './Chip';
import config from '../../../config.json';
import {Chip} from '../../controls';
import {useFilter} from './Provider';

export default function Network() {
	const {networks, setNetworks} = useFilter();

	const label = useMemo(() => {
		if(networks.length === 0) return 'Select a network';
		if(networks.length === config.chains.length) return 'All networks';
		return config.chains
			.filter(chain => networks.includes(chain.id))
			.map(chain => chain.name)
			.join(', ');
	}, [networks]);

	const toggle = useCallback((id: number) => {
		return () => {
			setNetworks(current => {
				const index = current.indexOf(id);
				if(index < 0) return [...current, id];
				const result = [...current];
				result.splice(index, 1);
				return result;
			});
		};
	}, [setNetworks]);

	return <FilterChip label={label} className={`
		flex items-center gap-3`}>
		{config.chains.map(chain => 
			<Chip key={chain.id} label={chain.name} onClick={toggle(chain.id)} hot={networks.includes(chain.id)} />
		)}
	</FilterChip>;
}
