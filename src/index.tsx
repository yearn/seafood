import React from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import './chains.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const container = document.getElementById('root');
const root = createRoot(container!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
root.render(<React.StrictMode><App /></React.StrictMode>);

serviceWorkerRegistration.register();
