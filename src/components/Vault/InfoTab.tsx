import React, {useMemo} from 'react';
import {Vault} from '../../context/useVaults/types';
import {formatPercent} from '../../utils/utils';

function	parseMarkdown(markdownText: string) {
	const htmlText = markdownText
		.replace(/\[(.*?)\]\((.*?)\)/gim, "<a class='link' target='_blank' href='$2'>$1</a>")
		.replace(/~~(.*?)~~/gim, "<span class='text-primary-500'>$1</span>")
		.replace(/\*\*(.*?)\*\*/gim, "<span class='font-bold'>$1</span>")
		;

	return htmlText.trim();
}

export default function InfoTab({vault}: {vault: Vault}) {
	const activeStrategies = useMemo(() => {
		if(vault.withdrawalQueue.length === 1) return vault.withdrawalQueue;
		return vault.withdrawalQueue.filter(v => v.debtRatio?.gt(0));
	}, [vault]);

	return <div className={'flex flex-col gap-2'}>
		<div>
			<div className={'font-bold'}>{`Token: ${vault.token.symbol}`}</div>
			<div className={'sm:text-sm'}>{vault.token.description || 'No description found.'}</div>
		</div>
		{activeStrategies.map(strategy => <div key={strategy.address}>
			<div className={'font-bold'}>{`${formatPercent((strategy.debtRatio?.toNumber() || 0) / 10_000)} ${strategy.name}`}</div>
			<div className={'sm:text-sm'} dangerouslySetInnerHTML={{__html: parseMarkdown((strategy.description || 'No description found.').replaceAll('{{token}}', vault.token.symbol))}} />
		</div>)}
	</div>;
}
