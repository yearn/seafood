import React, {useCallback} from 'react';
import {TbBrandGithub} from 'react-icons/tb';
import {useAuth} from '../context/useAuth';
import Lux from './Lux';

function Button({onClick, className, children}) {
	return <button onClick={onClick}
		className={`
		sm:w-full sm:px-16 py-6 sm:py-4 h-fit
		sm:bg-selected-300 sm:dark:bg-selected-600
		text-selected-900 dark:text-secondary-50
		sm:text-selected-900 sm:hover:text-selected-50
		sm:dark:text-secondary-900 sm:dark:hover:text-secondary-50
		whitespace-nowrap
		transition duration-200
		${className}`}>
		{children}
	</button>;
}

export default function Profile() {
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

	const browseProfile = useCallback(() => {
		window.open(profile.html_url, '_blank', 'noreferrer');
	}, [profile]);

	if(!profile) return <div className={`
		group relative flex flex-col items-center justify-center`}>
		<div className={`
		aspect-square w-28 sm:w-10
		flex items-center justify-center
		sm:group-hover:bg-selected-300
		dark:sm:group-hover:bg-selected-600
		transition duration-200
		rounded-full`} title={'Sign in using Github'}>
			<TbBrandGithub className={`
				text-4xl sm:text-2xl
				text-selected-900 group-hover:text-selected-900
				dark:text-secondary-50 dark:group-hover:text-white`} />
		</div>
		<div className={`
			pointer-events-none group-hover:pointer-events-auto
      sm:absolute sm:w-12 sm:top-0 sm:right-0 sm:opacity-0 group-hover:opacity-100
      sm:pt-[110px] flex items-center justify-center
			transition duration-200`}>
			<div className={'sm:absolute sm:-right-4 w-fit h-fit flex flex-col sm:shadow-md'}>
				<Button onClick={login} className={'sm:rounded-t-lg sm:border-b sm:border-b-black/10'}>
					{'Sign in with Github'}
				</Button>
				<Lux className={`
					w-full h-fit px-16 py-6 sm:py-4
					sm:bg-selected-300 sm:dark:bg-selected-600
					text-selected-900 dark:text-secondary-50
					sm:text-selected-900 sm:hover:text-selected-50
					sm:dark:text-secondary-900 sm:dark:hover:text-secondary-50
					transition duration-200
					rounded-b-lg`} />
			</div>
		</div>
	</div>;

	return <div className={`
		group relative flex flex-col items-center justify-center`}>
		<img className={`
		w-28 h-28 sm:w-10 sm:h-10 
		border-8 sm:border-2 border-selected-200 bg-selected-200
		group-hover:border-selected-400
		transition duration-200
		cursor-pointer rounded-full`}
		onClick={browseProfile}
		src={profile.avatar_url} 
		alt={'avatar'} />
		<div className={`
			pointer-events-none group-hover:pointer-events-auto
      sm:absolute sm:w-12 sm:top-0 sm:right-0 sm:opacity-0 group-hover:opacity-100
      sm:pt-[140px] flex items-center justify-center
			transition duration-200`}>
			<div className={'sm:absolute sm:-right-4 w-fit h-fit flex flex-col sm:shadow-md'}>
				<Button onClick={browseProfile} className={'sm:rounded-t-lg sm:border-b sm:border-b-black/10'}>
					{profile.login}
				</Button>
				<Button onClick={logout} className={'sm:border-b sm:border-b-black/10'}>
					{'Logout'}
				</Button>
				<Lux className={`
					w-full h-fit px-16 py-6 sm:py-4
					sm:bg-selected-300 sm:dark:bg-selected-600
					text-selected-900 dark:text-secondary-50
					sm:text-selected-900 sm:hover:text-selected-50
					sm:dark:text-secondary-900 sm:dark:hover:text-secondary-50
					transition duration-200
					rounded-b-lg`} />
			</div>
		</div>
	</div>;
}