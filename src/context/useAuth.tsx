import React, {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import useLocalStorage from '../utils/useLocalStorage';
import {Octokit} from '@octokit/core';

export interface AuthToken {
	access_token: string,
	expires_in: number,
	refresh_token: string,
	refresh_token_expires_in: number,
	scope: string,
	token_type: string
}

export interface AuthProfile {
	login: string,
	avatar_url: string,
	html_url: string
}

async function fetchProfile(token: AuthToken) {
	const octokit = new Octokit({auth: token.access_token});
	return (await octokit.request('GET /user')).data;
}

export async function refreshToken(token: AuthToken) {
	return await (await fetch('/api/github/refreshToken', {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(token)
	})).json();
}

interface AuthContext {
	authenticated: boolean,
	token: AuthToken | undefined,
	profile: AuthProfile | undefined,
	setToken: (token: AuthToken) => void,
	login: () => void,
	logout: () => void,
	browseProfile: () => void
}

const authContext = createContext({} as AuthContext);

export const useAuth = () => useContext<AuthContext>(authContext);

export default function AuthProvider({children}: {children: ReactNode}) {
	const [token, setToken] = useLocalStorage('token', undefined);
	const [profile, setProfile] = useState<AuthProfile | undefined>();
	const authenticated = useMemo(() => Boolean(profile), [profile]);

	const login = useCallback(() => {
		const subdomain = window.location.hostname.split('.')[0];
		const deployment = subdomain !== 'seafood' ? subdomain : '';
		const redirect = process.env.REACT_APP_GITHUB_REDIRECT
			+ `?deployment=${deployment}`;
		const authorizeUrl = 'https://github.com/login/oauth/authorize'
			+ `?client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}`
			+ '&scope=repo'
			+ `&redirect_uri=${redirect}`;
		window.location.assign(encodeURI(authorizeUrl));
	}, []);

	const logout = useCallback(() => {
		setToken(undefined);
		setProfile(undefined);
	}, [setToken, setProfile]);

	useEffect(() => {
		if(!token) {setProfile(undefined); return;}
		(async () => {
			try {
				setProfile(await fetchProfile(token));
			/* eslint-disable @typescript-eslint/no-explicit-any */
			} catch(error: any) {
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

	const browseProfile = useCallback(() => {
		if(!profile) return;
		window.open(profile.html_url, '_blank', 'noreferrer');
	}, [profile]);

	return <authContext.Provider value={{
		authenticated,
		token, 
		setToken,
		profile,
		login,
		logout,
		browseProfile
	}}>
		{children}
	</authContext.Provider>;
}
