// adapter from https://dev.to/noconsulate/react-pwa-with-workbox-6dl

/**
 * Listens for update events on ServerWorkerRegistrations
 * @version 1.1
 */

interface RegistrationListener {
	registration: ServiceWorkerRegistration, 
	target: EventTarget, 
	type: string, 
	listener: EventListenerOrEventListenerObject  
}

export default class ServiceWorkerUpdateListener extends EventTarget {

	_registrations: ServiceWorkerRegistration[] = [];
	_registrationListeners: RegistrationListener[] = [];
	onupdateinstalling: (event: Event) => void = () => {return;};
	onupdatewaiting: (event: Event) => void = () => {return;};
	onupdateready: (event: Event) => void = () => {return;};

	/**
	 * Add a registration to start listening for update events
	 * @param {ServiceWorkerRegistration} registration
	 */
	addRegistration(registration: ServiceWorkerRegistration) {
		if(this._registrations.includes(registration)) return;
		this._registrations.push(registration);

		const addEventListenerForRegistration = (
			registration: ServiceWorkerRegistration, 
			target: EventTarget, 
			type: string, 
			listener: EventListenerOrEventListenerObject
		) => {
			this._registrationListeners.push({registration, target, type, listener});
			target.addEventListener(type, listener);
		};

		const dispatchUpdateStateChange = (
			state: string, 
			serviceWorker: ServiceWorker | undefined | null, 
			registration: ServiceWorkerRegistration | undefined | null
		) => {
			const type = `update${state}`;
			const method = `on${type}`;
			/* eslint-disable @typescript-eslint/no-explicit-any */
			const methodRef = (this as any)[method];
			const event = new CustomEvent(type, {detail: {serviceWorker, registration}});
			this.dispatchEvent(event);
			if (methodRef && typeof methodRef === 'function') methodRef.call(this, event);
		};

		if(registration.waiting) dispatchUpdateStateChange('waiting', registration.waiting, registration);

		addEventListenerForRegistration(registration, registration, 'updatefound', () => {
			if(!(registration.active && registration.installing)) return;
			addEventListenerForRegistration(registration, registration.installing, 'statechange', event => {
				if ((event.target as ServiceWorker)?.state !== 'installed') return;
				dispatchUpdateStateChange('waiting', registration.waiting, registration);
			});
			dispatchUpdateStateChange('installing', registration.installing, registration);
		});

		addEventListenerForRegistration(registration, navigator.serviceWorker, 'controllerchange', event => {
			console.log('event.target', event.target);
			/* eslint-disable @typescript-eslint/no-explicit-any */
			(event.target as any).ready.then((registration: ServiceWorkerRegistration) => {
				dispatchUpdateStateChange('ready', registration.active, registration);
			});
		});
	}

	/**
	 * Remove a registration to stop listening for update events
	 * @param {ServiceWorkerRegistration} registration
	 */
	removeRegistration(registration: ServiceWorkerRegistration) {
		if (this._registrations.length <= 0) return;

		const removeEventListenersForRegistration = (registration: ServiceWorkerRegistration) => {
			this._registrationListeners = this._registrationListeners.filter(eventListener => {
				if (eventListener.registration === registration) {
					eventListener.target.removeEventListener(eventListener.type, eventListener.listener);
					return false;
				} else {
					return true;
				}
			});
		};

		this._registrations = this._registrations.filter(current => {
			if (current === registration) {
				removeEventListenersForRegistration(registration);
				return false;
			} else {
				return true;
			}
		});
	}

	/**
	 * Force the service worker to move from waited to activating state.
	 * 
	 * Note: This requires the service worker script file to listen for this message, for example:
	 * self.addEventListener('message', event => { if (event.data === 'skipWaiting') return skipWaiting() });
	 * @param {ServiceWorker} serviceWorker 
	 */
	skipWaiting(serviceWorker: ServiceWorker) {
		serviceWorker.postMessage({type: 'SKIP_WAITING'});
	}
}