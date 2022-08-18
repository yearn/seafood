import React, {useState, useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {Dialog} from '../controls';
import EventList from '../EventList';

export default function EventsDialog({block}) {
	const location = useLocation();
	const [show, setShow] = useState(false);

	useEffect(() => {
		setShow(location.hash === '#events');
	}, [location]);

	return <Dialog show={show}>
		<div className={'grow'}>
			{block?.result?.events.length > 0 && <div className={'max-h-full flex flex-col'}>
				<div className={'px-4 pt-4 pb-8'}>
					<h2 className={'text-xl'}>{'Events'}</h2>
				</div>
				<div className={'tiles px-4'}>
					<EventList events={block.result.events} />
				</div>
			</div>}
			{!block?.result?.events.length && <div className={'h-full flex items-center justify-center text-2xl'}>
				{'No events'}
			</div>}
		</div>
	</Dialog>;
}