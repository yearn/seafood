import React, {useState} from 'react';
import {useServiceWorkerUpdateListener} from '../context/useServiceWorkerUpdateListener';
import {Button} from './controls';

export default function CheckForUpdates() {
	const {updateWaiting, skipWaiting} = useServiceWorkerUpdateListener();
	const [dismissed, setDismissed] = useState(false);

	if(!updateWaiting || dismissed) return <></>;

	return <div className={`
		fixed z-50 top-0 w-full h-32 sm:h-14 px-4 sm:px-0
		flex flex-col sm:flex-row items-center justify-center gap-4
		text-lg bg-secondary-900 bg-stripes bg-stripes-black`}>
		<div className={'rainbow-text font-bold drop-shadow'}>{'><(((*> - Fresh Seafood version is ready!'}&nbsp;</div>
		<div className={'w-full sm:w-fit flex items-center justify-end gap-2 sm:gap-4 text-sm'}>
			<Button label={'Install'} onClick={skipWaiting}></Button>
			<Button label={'Dismiss'} onClick={() => setDismissed(true)}></Button>
		</div>
	</div>;
} 