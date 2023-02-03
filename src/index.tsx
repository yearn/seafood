import React from 'react';
import {createRoot} from 'react-dom/client';
import * as Sentry from '@sentry/react';
import {BrowserTracing} from '@sentry/tracing';
import './index.css';
import './chains.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

Sentry.init({
	dsn: process.env.REACT_APP_SENTRY_DSN,
	integrations: [new BrowserTracing()],
	tracesSampleRate: parseFloat(process.env.REACT_APP_SENTRY_TRACE_SAMPLE_RATE || '0.0'),
});

const container = document.getElementById('root');
const root = createRoot(container!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
root.render(<React.StrictMode>
	<Sentry.ErrorBoundary>
		<App />
	</Sentry.ErrorBoundary>
</React.StrictMode>);

serviceWorkerRegistration.register();
