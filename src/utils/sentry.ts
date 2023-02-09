import * as Sentry from '@sentry/react';
import {BrowserTracing} from '@sentry/tracing';

function scrubTags(value: Sentry.Event) {
	if(Object.keys(value).some(k => k === 'tags')) delete value.tags;
}

function isObject(value: unknown) {
	return value && typeof value === 'object' && value.constructor === Object;
}

function scrubSensativeData(value: Sentry.Event) {
	scrubTags(value);
	for(const property of Object.values(value)) {
		if(isObject(property)) scrubSensativeData(property);
	}
}

export function setupSentry() {
	Sentry.init({
		dsn: process.env.REACT_APP_SENTRY_DSN,
		integrations: [new BrowserTracing()],
		tracesSampleRate: parseFloat(process.env.REACT_APP_SENTRY_TRACE_SAMPLE_RATE || '0.0'),
		beforeSend: event => {
			scrubSensativeData(event);
			return event;
		},
		beforeSendTransaction: event => {
			scrubSensativeData(event);
			return event;
		}
	});
}
