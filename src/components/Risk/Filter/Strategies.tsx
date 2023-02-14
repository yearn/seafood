import React, {useCallback, useMemo} from 'react';
import FilterChip from './Chip';
import {Chip} from '../../controls';
import {StrategyFilter, useFilter} from './Provider';

export default function Strategies() {
	const {strategies, setStrategies} = useFilter();

	const label = useMemo(() => {
		const result = [] as string[];
		if(strategies.gtZeroDebt) result.push(strategies.hideInactive ? 'Active strategies' : 'Debt > 0');
		if(!strategies.gtZeroDebt && strategies.hideInactive) result.push('Hide inactive group');
		if(strategies.hideCurve) result.push('Hide curve');
		if(result.length === 0) return 'All strategies';
		return result.join(', ');
	}, [strategies]);

	const toggle = useCallback((key: string) => {
		return () => {
			setStrategies(current => {
				const result = {...current};
				result[key as keyof StrategyFilter] = !result[key as keyof StrategyFilter];
				return result;
			});
		};
	}, [setStrategies]);

	return <FilterChip hash={'strategies'} label={label}>
		<div className={'w-full h-full flex flex-col'}>
			<div className={'sm:hidden pl-6 pt-5 font-bold text-lg'}>{'Strategy filters'}</div>
			<div className={'grow flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-3'}>
				<Chip onClick={toggle('gtZeroDebt')} label={'Debt > 0'} hot={strategies.gtZeroDebt} />
				<Chip onClick={toggle('hideInactive')} label={'Hide inactive group'} hot={strategies.hideInactive} />
				<Chip onClick={toggle('hideCurve')} label={'Hide curve'} hot={strategies.hideCurve} />
			</div>
		</div>
	</FilterChip>;
}
