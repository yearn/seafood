import React from 'react';
import {createRoot} from 'react-dom/client';
import * as Sentry from '@sentry/react';
import {setupSentry} from './utils/sentry';
import './index.css';
import './chains.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

setupSentry();

const container = document.getElementById('root');
const root = createRoot(container!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
root.render(<React.StrictMode>
	<Sentry.ErrorBoundary>
		<App />
	</Sentry.ErrorBoundary>
</React.StrictMode>);

serviceWorkerRegistration.register();
