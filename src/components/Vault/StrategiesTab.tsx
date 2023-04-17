import React, {useMemo} from 'react';
import Strategy from './Strategy';
import EmptySlot from './EmptySlot';
import {Vault} from '../../context/useVaults/types';

export default function StrategiesTab({vault}: {vault: Vault}) {
	const queue = useMemo(() => {
		if(!vault) return [];
		const result = Array(20).fill(null).map((empty, index) => {
			return vault.withdrawalQueue.length >= index
				? vault.withdrawalQueue[index]
				: empty;
		});
		return result;
	}, [vault]);

	return <div className={`flex flex-col gap-2 
		pb-20`}>
		{queue.map((strategy, index) => <div key={index}>
			{strategy && <Strategy index={index} strategy={strategy} />}
			{!strategy && <EmptySlot index={index} />}
		</div>)}
	</div>;
}
