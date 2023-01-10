import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {RPCProviderContextApp} from './context/useRpcProvider';
import AuthProvider from './context/useAuth';
import VaultsProvider from './context/useVaults';
import FavoritesProvider from './context/useFavorites';
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
						<FavoritesProvider>
							<Chrome>
								<Routes>
									<Route path={'/'} exact={true} element={<Vaults />} />
									<Route path={'/vault/:address'} element={<Vault />} />
									<Route path={'/sandbox/*'} element={<Sandbox />} />
									<Route path={'/github/callback'} exact={true} element={<GithubCallback />} />
								</Routes>
							</Chrome>
						</FavoritesProvider>
					</VaultsProvider>
				</AuthProvider>
			</BrowserRouter>
		</RPCProviderContextApp>
	);
}

export default App;
