import React, {useCallback} from 'react';
import {useAuth} from '../context/useAuth';
import Lux from './Lux';

function Button({onClick, className, children}) {
	return <button onClick={onClick}
		className={`
		sm:w-full sm:px-16 py-6 sm:py-4 h-fit
		sm:bg-selected-300 sm:dark:bg-selected-500
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

	const browseProfile = useCallback(() => {
		window.open(profile.html_url, '_blank', 'noreferrer');	
	}, [profile]);

	if(!profile) return <div className={'aspect-square w-28 sm:w-10 bg-transparent rounded-full'} />;

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
				<Button onClick={browseProfile} className={'sm:rounded-t-lg sm:border-b sm:border-b-black/10'}>{profile.name}</Button>
				<Button onClick={logout} className={'sm:border-b sm:border-b-black/10'}>{'Logout'}</Button>
				<Lux className={`
					w-full h-fit px-16 py-6 sm:py-4
					sm:bg-selected-300 sm:dark:bg-selected-500
					text-selected-900 dark:text-secondary-50
					sm:text-selected-900 sm:hover:text-selected-50
					sm:dark:text-secondary-900 sm:dark:hover:text-secondary-50
					transition duration-200
					rounded-b-lg`} />
			</div>
		</div>
	</div>;
}