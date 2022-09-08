import React, {useEffect, useMemo} from 'react';
import axios from 'axios';
import {useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '../context/useAuth';
import Loading from './Loading';

export default function GithubCallback() {
	const location = useLocation();
	const navigate = useNavigate();
	const query = useMemo(() => new URLSearchParams(location.search), [location]);
	const {setBearer} = useAuth();

	useEffect(() => {
		axios.post('/api/github/callback', {code: query.get('code')}).then(result => {
			setBearer(result.data.bearer);
			navigate('/');
		});
	}, [query, navigate, setBearer]);

	return <div className={'w-full h-screen flex items-center justify-center'}>
		<Loading />
	</div>;
}