import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import useLocalStorage from '../utils/useLocalStorage';
import {Octokit} from '@octokit/core';

async function fetchProfile(token) {
	const octokit = new Octokit({auth: token.access_token});
	return (await octokit.request('GET /user')).data;
}

export async function refreshToken(token) {
	return await (await fetch('/api/github/refreshToken', {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(token)
	})).json();
}

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);
export default function AuthProvider({children}) {
	const [token, setToken] = useLocalStorage('token', null);
	const [profile, setProfile] = useState(null);
	const authenticated = useMemo(() => (profile || false), [profile]);

	const logout = useCallback(() => {
		setToken(null);
		setProfile(null);
	}, [setToken, setProfile]);

	useEffect(() => {
		if(!token) {setProfile(null); return;}
		(async () => {
			try {
				setProfile(await fetchProfile(token));
			} catch(error) {
				if(error.message === 'Bad credentials') {
					try {
						console.warn('token may have expired. attempt refresh..');
						const freshToken = await refreshToken(token);
						setToken(freshToken);
						console.warn('token has been refreshed');
					} catch(error) {
						console.warn('failed to refresh token');
						console.warn(error);
						logout();
					}
				}
			}
		})();
	}, [token, setToken, logout]);

	return <AuthContext.Provider value={{
		authenticated,
		token, 
		setToken,
		profile,
		logout
	}}>
		{children}
	</AuthContext.Provider>;
}