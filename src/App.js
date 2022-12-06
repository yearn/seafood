import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {RPCProviderContextApp} from './context/useRpcProvider';
import AuthProvider from './context/useAuth';
import VaultsProvider from './context/useVaults';
import FavoritesProvider from './context/useFavorites';
import SmsProvider from './context/useSms';
import Chrome from './components/Chrome';
import GithubCallback from './components/GithubCallback';
import Sandbox from './components/Sandbox';
import Vaults from './components/Vaults';
import Vault from './components/Vault';
import About from './components/About';

function App() {
	return (
		<RPCProviderContextApp>
			<BrowserRouter>
				<AuthProvider>
					<VaultsProvider>
						<FavoritesProvider>
							<SmsProvider>
								<Chrome>
									<Routes>
										<Route path={'/'} exact={true} element={<Vaults />} />
										<Route path={'/vault/:address'} element={<Vault />} />
										<Route path={'/sandbox/*'} element={<Sandbox />} />
										<Route path={'/about'} element={<About />} />
										<Route path={'/github/callback'} exact={true} element={<GithubCallback />} />
									</Routes>
								</Chrome>
							</SmsProvider>
						</FavoritesProvider>
					</VaultsProvider>
				</AuthProvider>
			</BrowserRouter>
		</RPCProviderContextApp>
	);
}

export default App;
