import {useEffect, useState} from 'react';
import ServiceWorkerUpdateListener from './ServiceWorkerUpdateListener';

export function useServiceWorkerUpdateListener() {
	const [listener, setListener] = useState<ServiceWorkerUpdateListener>();
	const [registration, setRegistration] = useState<ServiceWorkerRegistration>();
	const [updateWaiting, setUpdateWaiting] = useState(false);

	useEffect(() => {
		if(process.env.NODE_ENV !== 'development') {
			const listener = new ServiceWorkerUpdateListener();
			setListener(listener);

			listener.onupdatewaiting = () => {
				setUpdateWaiting(true);
			};

			listener.onupdateready = () => {
				window.location.reload();
			};

			navigator.serviceWorker.getRegistration().then((registration?: ServiceWorkerRegistration) => {
				if(!registration) return;
				listener.addRegistration(registration);
				setRegistration(registration);
			});
		}
	}, []);

	return {updateWaiting, skipWaiting: () => {
		if(!(listener && registration?.waiting)) return;
		listener.skipWaiting(registration.waiting);
	}};
}