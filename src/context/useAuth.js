import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import useLocalStorage from '../utils/useLocalStorage';
import {Octokit} from '@octokit/core';
import {useNavigate} from 'react-router-dom';

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);
export default function AuthProvider({children}) {
	const navigate = useNavigate();
	const [bearer, setBearer] = useLocalStorage('bearer', null);
	const authenticated = useMemo(() => bearer || false, [bearer]);
	const [profile, setProfile] = useState(null);

	const logout = useCallback(() => {
		setBearer(null);
		navigate('/');
	}, [setBearer, navigate]);

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
		}
	}, [bearer, logout]);

	return <AuthContext.Provider value={{bearer, setBearer, authenticated, profile, logout}}>
		{children}
	</AuthContext.Provider>;
}