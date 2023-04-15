import React from 'react';
import ScrollContainer from 'react-indiana-drag-scroll';
import {BiggerThanSmallScreen, SmallScreen} from '../../../utils/breakpoints';
import {useFilter} from './useFilter';
import Chips from './Chips';
import Search from './Search';

export default function Filter({showVaultCount = false}) {
	const {filter} = useFilter();

	return <>
		<SmallScreen>
			<div className={'w-full py-4 flex flex-col gap-3'}>
				<Search className={'w-full'} />
				<ScrollContainer className={'flex items-center w-full'}>
					<Chips></Chips>
				</ScrollContainer>
			</div>
		</SmallScreen>
		<BiggerThanSmallScreen>
			<div className={'z-10 flex items-center gap-3'}>
				<div className={'relative flex items-center justify-center'}>
					<Search />
				</div>
				<div className={'w-full flex items-center justify-between'}>
					<Chips></Chips>
					<div className={'text-2xl'}>
						{showVaultCount && `${filter.length} Vaults`}
					</div>
				</div>
			</div>
		</BiggerThanSmallScreen>
	</>;
}