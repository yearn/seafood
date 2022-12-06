import React from 'react';
import {A} from './controls';
import Icon from './Icon';
import Wordmark from './Wordmark';

export default function About() {
	return <div className={'text-pink-400 w-full h-screen flex flex-col items-center justify-center'}>
		<Icon className={'w-32 h-32'} />
		<Wordmark className={'text-8xl'} />
		<A title={'Seafood @ GitHub'} 
			target={'_blank'} 
			href={'https://github.com/yearn/dashboard_ui'} 
			rel={'noreferrer'} 
			className={'my-12 text-xl'}>
			{'https://github.com/yearn/dashboard_ui'}
		</A>
	</div>;
}