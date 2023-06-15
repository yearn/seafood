import React from 'react';
import {Spinner} from './controls';
import SpeechBubble from './SpeechBubble';

export default function Loading() {
	return <div className={`
		absolute inset-0 flex items-center justify-center`}>
		<div className={'flex flex-col items-center justify-center gap-4'}>
			<SpeechBubble text={'Howdy Anon!'} large={true} />
			<div className={'w-60 font-bold rainbow-text text-xl text-center'}>
				{'I\'m aggregating Yearn\'s data across all chains for you. Un momento please..'}
			</div>
			<Spinner />
			<div className={'w-60 text-xs text-secondary-400 text-center'}>
				{'This should take about one minute. You only have to wait this first time. Data will sync in the background after this.'}
			</div>
		</div>
	</div>;
}
