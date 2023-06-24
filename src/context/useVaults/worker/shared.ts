declare const self: SharedWorkerGlobalScope; // chrome://inspect/#workers
import * as Comlink from 'comlink';
import {api} from './index';

self.onconnect = (event: MessageEvent): void => {
	const port = event.ports[0];
	Comlink.expose(api, port);
};

export {api};