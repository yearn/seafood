import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import useLocalStorage from '../utils/useLocalStorage';
import {Octokit} from '@octokit/core';

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);
export default function AuthProvider({children}) {
	const [bearer, setBearer] = useLocalStorage('bearer', null);
	const authenticated = useMemo(() => bearer || false, [bearer]);
	const [profile, setProfile] = useState(null);

	const logout = useCallback(() => {
		setBearer(null);
	}, [setBearer]);

	useEffect(() => {
		if(bearer) {
			const octokit = new Octokit({auth: bearer});
			octokit.request('GET /user').then(result => {
				setProfile(result.data);
			}).catch(error => {
				if(error.message === 'Bad credentials') {
					logout();
				}
			});
		} else {
			setProfile(null);
		}
	}, [bearer, logout]);

	return <AuthContext.Provider value={{bearer, setBearer, authenticated, profile, logout}}>
		{children}
	</AuthContext.Provider>;
}