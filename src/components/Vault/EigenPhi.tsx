import React, {useCallback} from 'react';
import {Pebble} from '../controls';
import {getEigenTxExplorer} from '../../utils/utils';

export default function EigenPhi({tx}: {tx: string}) {
	const navigate = useCallback(() => {
		window.open(getEigenTxExplorer(tx), '_blank', 'noreferrer');
	}, [tx]);

	return <Pebble title={'Explore on EigenPhi'} onClick={navigate}>
		{'φ'}
	</Pebble>;
}
