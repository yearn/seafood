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

	return <FilterChip hash={'network'} label={label}>
		<div className={'w-full h-full flex flex-col'}>
			<div className={'sm:hidden pl-6 pt-5 font-bold text-lg'}>{'Network filters'}</div>
			<div className={'grow flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-3'}>
				{config.chains.map(chain => 
					<Chip key={chain.id} 
						label={chain.name} 
						onClick={toggle(chain.id)} 
						hot={networks.includes(chain.id)} 
						className={'text-xl sm:text-sm'} />
				)}
			</div>
		</div>
	</FilterChip>;
}
