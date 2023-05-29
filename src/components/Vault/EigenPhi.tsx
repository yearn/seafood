import React, {useCallback} from 'react';
import {Pebble} from '../controls';
import {getEigenTxExplorer} from '../../utils/utils';

export default function EigenPhi({tx}: {tx?: string}) {
	const navigate = useCallback(() => {
		if(!tx) return;
		window.open(getEigenTxExplorer(tx), '_blank', 'noreferrer');
	}, [tx]);

	return <Pebble title={'Explore on EigenPhi'} onClick={navigate}>
		<img width={'16'} height={16} src={'/eigentx.png'} alt={'EigenPhi'} className={'grayscale group-hover:brightness-0'} />
	</Pebble>;
}
