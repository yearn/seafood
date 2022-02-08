import React from 'react';
import {Route, Routes, BrowserRouter} from 'react-router-dom';
import SingleVaultPage from './pages/SingleVault';
import DefaultPage from './pages/Default';
import {RPCProviderContextApp} from './context/useRpcProvider';

function App() {
	return (
		<RPCProviderContextApp>
			<div>
				<BrowserRouter>
					<Routes>
						<Route path={'/'} exact={true} element={<DefaultPage />}></Route>
						<Route path={'/vault'} element={<SingleVaultPage />}></Route>
					</Routes>
				</BrowserRouter>
			</div>
		</RPCProviderContextApp>
	);
}

export default App;
