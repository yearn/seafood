import React, {useMemo} from 'react';
import {useLocation} from 'react-router-dom';

function EventList({events}){
	function keys(args) {
		return Object.keys(args).filter(k => isNaN(k));
	}
	return <>
		{events.map(e => {
			if(e.event){
				return <div key={e.data}>
					<div className={'font-bold text-xl'}>{e.event}</div>
					{keys(e.args).map((key, index) => <div key={key} className={`
						px-4 py-2 w-full flex items-center justify-between rounded
						${index % 2 === 0 ? '' : 'bg-selected-400/5'}`}>
						<div>{key}</div>
						<div className={'font-mono'}>{e.args[key].toString()}</div>
					</div>)}
				</div>;
			}
		})}
	</>;
}

export default function EventsDialog({blocks}) {
	const location = useLocation();

	const block = useMemo(() => {
		const index = parseInt(location.hash.replace('#events-block-index-', ''));
		return blocks[index];
	}, [location, blocks]);

	return <div className={'grow'}>
		{block?.result.events.length > 0 && <div className={'max-h-full flex flex-col'}>
			<div className={'px-4 pt-4 pb-8'}>
				<h2 className={'text-xl'}>{'Events'}</h2>
			</div>
			<div className={'tiles px-4'}>
				<EventList events={block.result.events} />
			</div>
		</div>}
		{block && !block.result.events.length && <div className={'h-full flex items-center justify-center text-2xl'}>
			{'No events'}
		</div>}
	</div>;
}