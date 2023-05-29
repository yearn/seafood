import React, {useCallback} from 'react';
import {Pebble} from '../controls';

export default function Tenderly({url, className}: {url: string, className?: string}) {
	const navigate = useCallback(() => {
		window.open(url, '_blank', 'noreferrer');
	}, [url]);

	return <Pebble title={'Explore on Tenderly'} onClick={navigate} className={className}>
		<img width={'100%'} height={'100%'} src={'/tenderly.png'} alt={'Tenderly'} className={'grayscale group-hover:brightness-0'} />
	</Pebble>;
}
