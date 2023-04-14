import React, {useCallback, useMemo} from 'react';
import FilterChip from './FilterChip';
import config from '../../../config.json';
import {Chip} from '../../controls';
import {useFilter} from './useFilter';

export default function Network() {
	const {chips, setChips} = useFilter();

	const networkFlags = useMemo(() => {
		return config.chains.map(chain => Boolean(chips[chain.name]));
	}, [chips]);

	const label = useMemo(() => {
		if(networkFlags.every(flag => !flag)) return 'Select a network';
		if(networkFlags.every(flag => flag)) return 'All networks';
		return config.chains
			.filter((_, index) => networkFlags[index])
			.map(chain => chain.name)
			.join(', ');
	}, [networkFlags]);

	const toggle = useCallback((index: number) => {
		return () => {
			setChips((current: {[key: string]: boolean}) => {
				const result = {...current};
				result[config.chains[index].name] = !networkFlags[index];
				return result;
			});
		};
	}, [networkFlags, setChips]);

	return <FilterChip hash={'network'} label={label}>
		<div className={'w-full h-full flex flex-col'}>
			<div className={'sm:hidden pl-6 pt-5 font-bold text-lg'}>{'Network filters'}</div>
			<div className={'grow flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-3'}>
				{config.chains.map((chain, index) => 
					<Chip key={chain.id} 
						label={chain.name} 
						onClick={toggle(index)} 
						hot={networkFlags[index]} 
						className={'text-xl sm:text-sm'} />
				)}
			</div>
		</div>
	</FilterChip>;
}
