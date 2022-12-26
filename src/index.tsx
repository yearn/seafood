import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './chains.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

ReactDOM.render(
	<React.StrictMode><App /></React.StrictMode>, document.getElementById('root')
);

// serviceWorkerRegistration.unregister();
serviceWorkerRegistration.register();