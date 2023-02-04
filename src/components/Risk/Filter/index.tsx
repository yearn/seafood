import React from 'react';
import Network from './Network';
import Scores from './Scores';
import Search from './Search';
import Strategies from './Strategies';

export default function Filter() {
	return <div className={'pl-4 flex items-center gap-3'}>
		<Search />
		<Network />
		<Strategies />
		<Scores />
	</div>;
}
