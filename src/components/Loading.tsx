import React from 'react';
import {Spinner} from './controls';
import SpeechBubble from './SpeechBubble';

export default function Loading() {
	return <div className={`
		absolute inset-0 flex items-center justify-center`}>
		<div className={'flex flex-col items-center justify-center gap-4'}>
			<SpeechBubble text={'Howdy anon!'} large={true} />
			<div className={'w-60 font-bold rainbow-text text-xl text-center'}>{'Just need a minute to get Seafood setup for you'}</div>
			<Spinner />
		</div>
	</div>;
}
