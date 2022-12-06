import React from 'react';
import {useVaults} from '../context/useVaults';
import TimeAgo from 'react-timeago';

export default function Sync({expand}) {
	const {loading, cachetime, refresh} = useVaults();

	function timeAgoFormatter(value, unit, suffix, epochMilliseconds, nextFormatter) {
		if(unit === 'second') {
			return 'moments ago';
		} else {
			return nextFormatter();
		}
	}

	return <div onClick={refresh} className={`
		flex items-center gap-3
		${loading ? '' : 'cursor-pointer'}`}>
		{expand && <div className={`
			text-[0.62rem]
			${loading ? 'text-selected-500' : 'text-primary-600 dark:text-primary-400'}`}>
			{loading && 'Syncing'}
			{!loading && cachetime > 0 && <div>
				{'Synced '}<TimeAgo date={cachetime} minPeriod={60} formatter={timeAgoFormatter}></TimeAgo>
			</div>}
		</div>}
		<div className={'relative flex items-center justify-center h-3 w-3'}>
			{loading && <div className={`
				absolute h-full w-full rounded-full 
				bg-selected-400 
				opacity-75 animate-ping`} />}
			<div className={`
				rounded-full h-2 w-2
				${loading ? 'bg-selected-500' : 'bg-primary-400'}`} />
		</div>
	</div>;
}