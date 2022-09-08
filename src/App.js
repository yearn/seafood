import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import {RPCProviderContextApp} from './context/useRpcProvider';
import AuthProvider from './context/useAuth';
import Router from './components/Router';

function App() {
	return (
		<RPCProviderContextApp>
			<BrowserRouter>
				<AuthProvider>
					<Router />
				</AuthProvider>
			</BrowserRouter>
		</RPCProviderContextApp>
	);
}

export default App;
