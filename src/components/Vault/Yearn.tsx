import React, {useCallback} from 'react';
import {Pebble} from '../controls';
import {getYearnExplorer} from '../../utils/utils';
import {Vault} from '../../context/useVaults/types';

export default function Yearn({vault}: {vault?: Vault}) {
	const navigate = useCallback(() => {
		if(!vault) return;
		window.open(getYearnExplorer(vault), '_blank', 'noreferrer');
	}, [vault]);

	return <Pebble title={'Explore on Yearn Finance'} onClick={navigate}>
		<img width={18} height={18} src={'/yearn.svg'} alt={'Yearn Finance'} className={`
			brightness-0 group-hover:brightness-0
			dark:filter-none`} />
	</Pebble>;
}
