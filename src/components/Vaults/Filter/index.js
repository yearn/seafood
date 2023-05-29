import React from 'react';
import ScrollContainer from 'react-indiana-drag-scroll';
import {BiggerThanSmallScreen, SmallScreen} from '../../../utils/breakpoints';
import Chips from './Chips';
import Search from './Search';

export default function Filter() {
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
			<div className={'w-full flex items-center gap-3'}>
				<Search className={'grow relative flex items-center justify-center'} />
				<Chips></Chips>
			</div>
		</BiggerThanSmallScreen>
	</>;
}