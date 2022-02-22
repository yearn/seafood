import React from 'react';
import {Route, Routes, BrowserRouter} from 'react-router-dom';
import SingleVaultPage from './pages/SingleVault';
import MasterchefPage from './pages/Masterchef';
import DefaultPage from './pages/Default';
import TestAPI from './pages/TestAPI';
import {RPCProviderContextApp} from './context/useRpcProvider';
import Settings from './pages/Settings';
import MainNavigation from './components/layout/MainNavigation';
import Sandbox from './pages/Sandbox';

function App() {
	return (
		<RPCProviderContextApp>
			<div className={'relative max-w-full min-h-screen'}>
				<div className={'fixed z-0 w-screen h-screen bg-gradient-to-b from-slate-900 via-app-900 to-app-800'}></div>
				<div className={'absolute z-10 w-full pb-32'}>
					<BrowserRouter>
						<MainNavigation />
						<Routes>
							<Route path={'/'} exact={true} element={<DefaultPage />}></Route>
							<Route path={'/vault'} element={<SingleVaultPage />}></Route>
							<Route path={'/masterchef'} element={<MasterchefPage />}></Route>
							<Route path={'/testAPI'} element={<TestAPI />}></Route>
							<Route path={'/settings'} element={<Settings />}></Route>
							<Route path={'/sandbox'} element={<Sandbox />}></Route>
						</Routes>
					</BrowserRouter>
				</div>
			</div>
		</RPCProviderContextApp>
	);
}

export default App;
