import React from 'react';
import {Route, Routes, BrowserRouter} from 'react-router-dom';
import SingleVaultPage from './pages/SingleVault';
import MasterchefPage from './pages/Masterchef';
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
            <Route path={'/masterchef'} element={<MasterchefPage />}></Route>
          </Routes>
				</BrowserRouter>
			</div>
		</RPCProviderContextApp>
	);
}

export default App;
