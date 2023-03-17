import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import NestProviders from './context/NestProviders';
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
import Risk from './components/Risk';
import RiskGroup from './components/Risk/Group';
import Status from './components/Status';

const Providers = NestProviders([
	[RPCProviderContextApp],
	[BrowserRouter],
	[AuthProvider],
	[VaultsProvider],
	[FavoritesProvider],
	[SmsProvider],
	[Chrome]
]);

function App() {
	return <Providers>
		<Routes>
			<Route path={'/'} exact={true} element={<Vaults />} />
			<Route path={'/vault/:address'} element={<Vault />} />
			<Route path={'/risk/*'} element={<Risk />} />
			<Route path={'/risk/:group'} element={<RiskGroup />} />
			<Route path={'/sandbox/*'} element={<Sandbox />} />
			<Route path={'/status/*'} element={<Status />} />
			<Route path={'/github/callback'} exact={true} element={<GithubCallback />} />
		</Routes>
	</Providers>;
}

export default App;
