import React from 'react';
import {TbBrandGithub} from 'react-icons/tb';
import {useAuth} from '../../context/useAuth';

export default function Profile({className}) {
	const {profile, logout} = useAuth();

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
		<TbBrandGithub />
	</div>;

	return <div 
		onClick={logout}
		title={'Sign out from Github'}
		className={`relative ${className}`}>
		<img
			src={profile.avatar_url} 
			alt={'avatar'}
			className={`
			absolute w-28 h-28 sm:w-9 sm:h-9
			rounded-full`} />
		<div className={'absolute w-28 h-28 sm:w-9 sm:h-9 rounded-full shadow-inner'}></div>
	</div>;
}