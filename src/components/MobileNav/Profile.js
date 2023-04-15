import React from 'react';
import {TbBrandGithub} from 'react-icons/tb';
import {useAuth} from '../../context/useAuth';
import Lux from '../Lux';

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
	const {profile, login, logout, browseProfile} = useAuth();

	if(!profile) return <div className={`
		group relative flex flex-col items-center justify-center`}>
		<div className={`
		aspect-square w-28
		flex items-center justify-center`} title={'Sign in using Github'}>
			<TbBrandGithub className={`
				text-4xl sm:text-2xl
				text-selected-900 group-hover:text-selected-900
				dark:text-secondary-50 dark:group-hover:text-white`} />
		</div>
		<div className={`
			pointer-events-none group-hover:pointer-events-auto
      group-hover:opacity-100
      flex items-center justify-center`}>
			<div className={'w-fit h-fit flex flex-col'}>
				<Button onClick={login}>
					{'Sign in with Github'}
				</Button>
				<Lux className={`
					w-full h-fit px-16 py-6
					text-selected-900 dark:text-secondary-50`} />
			</div>
		</div>
	</div>;

	return <div className={`
		group relative flex flex-col items-center justify-center`}>
		<img className={`
		w-28 h-28
		border border-selected-200 bg-selected-200
		group-hover:border-selected-400
		cursor-pointer`}
		onClick={browseProfile}
		src={profile.avatar_url} 
		alt={'avatar'} />
		<div className={`
			pointer-events-none group-hover:pointer-events-auto
      group-hover:opacity-100
      flex items-center justify-center`}>
			<div className={'w-fit h-fit flex flex-col'}>
				<Button onClick={browseProfile}>
					{profile.login}
				</Button>
				<Button onClick={logout}>
					{'Logout'}
				</Button>
				<Lux className={`
					w-full h-fit px-16 py-6
					text-selected-900 dark:text-secondary-50`} />
			</div>
		</div>
	</div>;
}