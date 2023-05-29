import React from 'react';
import Accordian from '../controls/Accordian';

function AccordianTitle({index}: {index: number}) {
	return <div className={'flex items-center gap-2 text-secondary-300 dark:text-secondary-800'}>
		<div className={'font-mono'}>{`[${index}]`}</div>
		<div className={'text-xl break-words truncate'}>{'- - - - - - - -'}</div>
	</div>;
}

export default function EmptySlot({index}: {index: number}) {
	return <Accordian
		title={<AccordianTitle index={index} />}
		disabled={true}
		className={'px-4 py-2 border dark:border-primary-900/40'}>
	</Accordian>;
}
