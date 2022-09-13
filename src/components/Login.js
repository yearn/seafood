import React from 'react';
import {TbBrandGithub} from 'react-icons/tb';
import {Button} from './controls';
import Lux from './Lux';
import Wordmark from './Wordmark';

export default function Login() {
	return <div className={`
		w-full h-screen px-4 sm:px-8
		flex flex-col sm:flex-row items-center justify-center sm:gap-12`}>
		<div className={'sm:w-1/2 flex flex-col items-center sm:items-end'}>
			<Wordmark className={'text-6xl sm:text-8xl'} />
			<p className={'mt-2 mb-24 sm:mb-0 sm:pr-2 text-xl sm:text-2xl text-center sm:text-right sm:max-w-sm'}>
				{'Yearn\'s internal dashboard for vault management and reporting'}
			</p>
		</div>
		<div className={'sm:w-1/2 flex items-center justify-center'}>
			<Button label={'Login with Github'}
				icon={TbBrandGithub}
				onClick={() => {
					const subdomain = window.location.hostname.split('.')[0];
					const deployment = subdomain !== 'seafood' ? subdomain : '';
					const redirect = process.env.REACT_APP_GITHUB_REDIRECT
						+ `?deployment=${deployment}`;
					const authorizeUrl = 'https://github.com/login/oauth/authorize'
						+ `?client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}`
						+ `&redirect_uri=${redirect}`;
					window.location = encodeURI(authorizeUrl);
				}}
				className={'py-6 text-xl sm:py-8 sm:px-6 sm:text-2xl'}
				iconClassName={'text-2xl sm:text-4xl'} />
		</div>
		<Lux className={'mt-24 sm:mt-0 sm:absolute sm:top-8 sm:right-8'} />
	</div>;
}