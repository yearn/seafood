import React from 'react';
import {Route, Routes, BrowserRouter} from 'react-router-dom';
import SingleVaultPage from './pages/SingleVault';
import MasterchefPage from './pages/Masterchef';
import DefaultPage from './pages/Default';
import TestAPI from './pages/TestAPI';
import {RPCProviderContextApp} from './context/useRpcProvider';
import Settings from './pages/Settings';
import Sandbox from './pages/Sandbox';
import {AppProvider} from './context/useApp';
import Chrome from './components/Chrome';

function App() {
	return (
		<RPCProviderContextApp>
			<BrowserRouter>
				<AppProvider>
					<Chrome>
						<Routes>
							<Route path={'/'} exact={true} element={<DefaultPage />}></Route>
							<Route path={'/vault'} element={<SingleVaultPage />}></Route>
							<Route path={'/masterchef'} element={<MasterchefPage />}></Route>
							<Route path={'/testAPI'} element={<TestAPI />}></Route>
							<Route path={'/settings'} element={<Settings />}></Route>
							<Route path={'/sandbox'} element={<Sandbox />}></Route>
						</Routes>
					</Chrome>
				</AppProvider>
			</BrowserRouter>
		</RPCProviderContextApp>
	);
}

export default App;
