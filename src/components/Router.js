import React from 'react';
import {Route, Routes} from 'react-router-dom';
import {AppProvider} from '../context/useApp';
import {useAuth} from '../context/useAuth';
import MasterchefPage from '../pages/Masterchef';
import Settings from '../pages/Settings';
import SolidlyTreasury from '../pages/SolidlyTreasury';
import TestAPI from '../pages/TestAPI';
import Chrome from './Chrome';
import GithubCallback from './GithubCallback';
import Login from './Login';
import Sandbox from './Sandbox';
import Vault from './Vault';
import Vaults from './Vaults';

export default function Router() {
	const {authenticated} = useAuth();

	return <>
		{!authenticated && <Chrome startWithHeader={false} fancy={true}>
			<Routes>
				<Route path={'/'} exact={true} element={<Login />} />
				<Route path={'/github/callback'} exact={true} element={<GithubCallback />} />
			</Routes>
		</Chrome>}
		{authenticated && <AppProvider>
			<Chrome>
				<Routes>
					<Route path={'/'} exact={true} element={<Vaults />} />
					<Route path={'/vault/:address'} element={<Vault />} />
					<Route path={'/masterchef'} element={<MasterchefPage />} />
					<Route path={'/solidly'} element={<SolidlyTreasury />} />
					<Route path={'/testAPI'} element={<TestAPI />} />
					<Route path={'/settings'} element={<Settings />} />
					<Route path={'/sandbox/*'} element={<Sandbox />} />
					<Route path={'/github/callback'} exact={true} element={<></>} />
				</Routes>
			</Chrome>
		</AppProvider>}
	</>;
}