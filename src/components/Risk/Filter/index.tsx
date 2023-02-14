import React from 'react';
import ScrollContainer from 'react-indiana-drag-scroll';
import Network from './Network';
import Scores from './Scores';
import Search from './Search';
import Strategies from './Strategies';

export default function Filter() {
	return <div className={`
		pt-2 sm:pt-0 px-2 sm:pl-4 
		flex flex-col sm:flex-row gap-3`}>
		<Search className={'w-[72%] sm:w-44 ml-[15%] sm:ml-0'} />
		<ScrollContainer className={'w-full flex items-center gap-3'}>
			<Network />
			<Strategies />
			<Scores />
		</ScrollContainer>
	</div>;
}
