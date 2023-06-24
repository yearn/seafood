import * as Comlink from 'comlink';
import {api} from './index';

Comlink.expose(api);

export {api};