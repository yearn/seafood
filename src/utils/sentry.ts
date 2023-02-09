import * as Sentry from '@sentry/react';

function scrubTags(value: Sentry.Event) {
	if(Object.keys(value).some(k => k === 'tags')) delete value.tags;
}

function isObject(value: unknown) {
	return value && typeof value === 'object' && value.constructor === Object;
}

function scrubSensitiveData(value: Sentry.Event) {
	scrubTags(value);
	for(const property of Object.values(value)) {
		if(isObject(property)) scrubSensitiveData(property);
	}
}

export function setupSentry() {
	Sentry.init({
		dsn: process.env.REACT_APP_SENTRY_DSN,
		beforeSend: event => {
			scrubSensitiveData(event);
			return event;
		},
		beforeSendTransaction: event => {
			scrubSensitiveData(event);
			return event;
		}
	});
}
