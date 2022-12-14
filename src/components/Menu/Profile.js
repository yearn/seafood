import React, {useMemo} from 'react';
import {TbBrandGithub} from 'react-icons/tb';
import {useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '../../context/useAuth';

export default function Profile({className}) {
	const navigate = useNavigate();
	const location = useLocation();
	const {profile} = useAuth();

	const match = useMemo(() => {
		return location.pathname === '/profile';
	}, [location]);

	const login = () => {
		const subdomain = window.location.hostname.split('.')[0];
		const deployment = subdomain !== 'seafood' ? subdomain : '';
		const redirect = process.env.REACT_APP_GITHUB_REDIRECT
			+ `?deployment=${deployment}`;
		const authorizeUrl = 'https://github.com/login/oauth/authorize'
			+ `?client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}`
			+ '&scope=repo'
			+ `&redirect_uri=${redirect}`;
		window.location = encodeURI(authorizeUrl);
	};

	if(!profile) return <div
		onClick={login}
		title={'Sign in using Github'}
		className={`
		flex items-center justify-center
		transition duration-200
		cursor-pointer
		${className}`}>
		<TbBrandGithub className={'w-5 h-5'} />
	</div>;

	return <div 
		onClick={() => navigate('/profile')}
		title={'Profile'}
		className={`relative 
			${className} 
			${match ? 'bg-primary-600 dark:bg-primary-600/20' : ''}`}>
		<img
			src={profile.avatar_url} 
			alt={'avatar'}
			className={`
			absolute w-28 h-28 sm:w-9 sm:h-9
			rounded-full`} />
	</div>;
}