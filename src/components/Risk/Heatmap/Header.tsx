import React, {useCallback} from 'react';
import {defaultRiskCategories} from '../../../context/useVaults/types';
import {humanizeRiskCategory} from '../../../utils/utils';
import {useFilter} from '../Filter/Provider';
import ColumnHeader from './ColumnHeader';

export default function Header() {
	const {sort, setSort} = useFilter();
	const categories = [...Object.keys(defaultRiskCategories())];

	const onClick = useCallback((key: string) => {
		return () => {
			setSort(current => {
				if(current.key === key) return {key, direction: current.direction === 'asc' ? 'desc' : 'asc'};
				return {key, direction: 'desc'};
			});
		};
	}, [setSort]);

	return <>
		<ColumnHeader>{'Group'}</ColumnHeader>
		{categories.map(category => <ColumnHeader 
			key={category} 
			onClick={onClick(category)}
			sortable={true} 
			sort={sort.key === category ? sort.direction : undefined}>
			{humanizeRiskCategory(category)}
		</ColumnHeader>)}
	</>;
}
