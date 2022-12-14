import React from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../context/useAuth';
import {A, Button} from './controls';

export default function Profile() {
	const navigate = useNavigate();

	const {profile, logout} = useAuth() as {
		profile: {
			avatar_url: string,
			html_url: string,
			name: string
		},
		logout: () => void
	};

	if(!profile) return <></>;

	return <div className={'w-full h-screen flex flex-col items-center justify-center gap-8'}>
		<img src={profile.avatar_url} 
			alt={'avatar'}
			className={`
			w-28 h-28 sm:w-48 sm:h-48
			rounded-full`} />
		<A href={profile.html_url} className={'text-4xl'} target={'_blank'} rel={'noreferrer'}>
			{profile.name}
		</A>
		<Button onClick={() => {
			logout();
			navigate('/');
		}} label={'Sign out of Github'} />
	</div>;
}