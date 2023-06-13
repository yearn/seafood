import React, {useCallback, useMemo} from 'react';
import FilterChip from './FilterChip';
import {Chip} from '../../controls';
import {useFilter} from './useFilter';

interface Option {
	key: string,
	label: string,
	long: string,
	flag: boolean
}

export default function VaultOptions() {
	const {chips, setChips} = useFilter();

	const options = useMemo(() => {
		return [{
			key: 'v2',
			label: 'v2',
			long: 'v2',
			flag: Boolean(chips['v2'])
		}, {
			key: 'v1',
			label: 'v1',
			long: 'v1',
			flag: Boolean(chips['v1'])
		}, {
			key: 'curve',
			label: 'Curve',
			long: 'Curve Vaults',
			flag: Boolean(chips['curve'])
		}, {
			key: 'factory',
			label: 'Factory',
			long: 'Factory Vaults',
			flag: Boolean(chips['factory'])
		}, {
			key: 'tvlgtzero',
			label: 'TVL>0',
			long: 'TVL > 0',
			flag: Boolean(chips['tvlgtzero'])
		}, {
			key: 'rewardsgtzero',
			label: 'Rwds>0',
			long: 'Rewards > 0',
			flag: Boolean(chips['rewardsgtzero'])
		}, {
			key: 'warnings',
			label: 'Warnings',
			long: 'Warnings Only',
			flag: Boolean(chips['warnings'])
		}] as Option [];
	}, [chips]);

	const label = useMemo(() => {
		if(options.every(o => !o.flag)) return 'Vaults';
		if(options.every(o => o.flag)) return 'All Vaults, TVL>0';
		const labels = options.filter(o => o.flag).map(o => o.label);
		return ['Vaults', ...labels].join(', ');
	}, [options]);

	const toggle = useCallback((option: Option) => {
		return () => {
			setChips((current: {[key: string]: boolean}) => {
				const result = {...current};
				result[option.key] = !option.flag;
				return result;
			});
		};
	}, [setChips]);

	return <FilterChip hash={'fixins'} label={label}>
		<div className={'w-full h-full flex flex-col'}>
			<div className={'sm:hidden pl-6 pt-5 font-bold text-lg'}>{'Vault filters'}</div>
			<div className={'grow flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-3'}>
				{options.map((option) => 
					<Chip key={option.key} 
						label={option.long} 
						onClick={toggle(option)} 
						hot={option.flag} 
						className={'text-xl sm:text-sm'} />
				)}
			</div>
		</div>
	</FilterChip>;
}
