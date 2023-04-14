import React from 'react';
import ScrollContainer from 'react-indiana-drag-scroll';
import useScrollOverpass from '../../../context/useScrollOverpass';
import {BiggerThanSmallScreen, SmallScreen} from '../../../utils/breakpoints';
import {useFilter} from './useFilter';
import Chips from './Chips';
import Search from './Search';

export default function Filter({showVaultCount = false}) {
	const {filter} = useFilter();
	const {overpassClassName} = useScrollOverpass();

	return <>
		<SmallScreen>
			<div className={`sticky top-0 z-10 py-4 ${overpassClassName}`}>
				<div className={'flex items-center justify-between'}>
					<div className={'w-1/5'}></div>
					<div className={'w-3/5 relative flex items-center justify-center'}>
						<Search />
					</div>
					<div className={'w-1/5 text-center text-xs'}>
						{showVaultCount && `${filter.length} Vaults`}
					</div>
				</div>
				<div className={'mt-4 px-4'}>
					<ScrollContainer className={'flex items-center w-full'}>
						<Chips></Chips>
					</ScrollContainer>
				</div>
			</div>
		</SmallScreen>
		<BiggerThanSmallScreen>
			<div className={`sticky top-0 z-10 pl-4 pr-8 py-2 flex items-center gap-3 ${overpassClassName}`}>
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