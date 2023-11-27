import React, {useState} from 'react';
import {useServiceWorkerUpdateListener} from '../context/useServiceWorkerUpdateListener';
import {Button} from './controls';
import Notification from './Notification';
import SpeechBubble from './SpeechBubble';

export default function CheckForUpdates() {
	const {updateWaiting, skipWaiting} = useServiceWorkerUpdateListener();
	const [dismissed, setDismissed] = useState(false);

	if(!updateWaiting || dismissed) return <></>;

	return <Notification>
		<SpeechBubble text={'Fresh Seafood is here!'} />
		<div className={'w-full sm:w-fit flex items-center justify-end gap-2 sm:gap-4 text-sm'}>
			<Button label={'Update'} onClick={skipWaiting}></Button>
			<Button label={'Dismiss'} onClick={() => setDismissed(true)}></Button>
		</div>
	</Notification>;
}
