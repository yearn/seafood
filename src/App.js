import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {RPCProviderContextApp} from './context/useRpcProvider';
import AuthProvider from './context/useAuth';
import {AppProvider} from './context/useApp';
import VaultsProvider from './context/useVaults';
import SmsProvider from './context/useSms';
import Chrome from './components/Chrome';
import GithubCallback from './components/GithubCallback';
import Sandbox from './components/Sandbox';
import Vaults from './components/Vaults';
import Vault from './components/Vault';

function App() {
	return (
		<RPCProviderContextApp>
			<BrowserRouter>
				<AuthProvider>
					<VaultsProvider>
						<AppProvider>
							<SmsProvider>
								<Chrome>
									<Routes>
										<Route path={'/'} exact={true} element={<Vaults />} />
										<Route path={'/vault/:address'} element={<Vault />} />
										<Route path={'/sandbox/*'} element={<Sandbox />} />
										<Route path={'/github/callback'} exact={true} element={<GithubCallback />} />
									</Routes>
								</Chrome>
							</SmsProvider>
						</AppProvider>
					</VaultsProvider>
				</AuthProvider>
			</BrowserRouter>
		</RPCProviderContextApp>
	);
}

export default App;
