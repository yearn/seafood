import React, {useCallback} from 'react';
import {Pebble} from '../controls';

export default function Tenderly({url, className}: {url: string, className?: string}) {
	const navigate = useCallback(() => {
		window.open(url, '_blank', 'noreferrer');
	}, [url]);

	return <Pebble title={'Explore on Tenderly'} onClick={navigate} className={className}>
		{'τ'}
	</Pebble>;
}
