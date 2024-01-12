import React, {useCallback, useMemo} from 'react';
import {formatPercent, getAddressExplorer} from '../../utils/utils';
import {A} from '../controls';
import {useVault} from './VaultProvider';

// adapted from yearn/web-ui
function parseMarkdown(markdownText: string) {
	const htmlText = markdownText
		.replace(/\[(.*?)\]\((.*?)\)/gim, "<a class='a' target='_blank' rel='noreferrer' href='$2'>$1</a>")
		.replace(/~~(.*?)~~/gim, "<span class='line-through'>$1</span>")
		.replace(/\*\*(.*?)\*\*/gim, "<span class='font-bold'>$1</span>")
		;
	return htmlText.trim();
}

export default function InfoTab() {
	const {vault} = useVault();
	const {metas} = useVault();

	const activeStrategies = useMemo(() => {
		if(vault.withdrawalQueue.length === 1) return vault.withdrawalQueue;
		return vault.withdrawalQueue.filter(v => v.debtRatio?.gt(0));
	}, [vault]);

	const getDescription = useCallback((address: string) => {
		return metas.withdrawalQueue.find(v => v.address === address)?.description || 'No description found.';
	}, [metas]);

	return <div className={'px-2 pb-16 flex flex-col gap-3'}>
		<div>
			<div className={'font-bold text-lg'}>
				<A href={getAddressExplorer(vault.network.chainId, vault.token.address)} target={'_blank'} rel={'noreferrer'}>
					{vault.token.symbol}
				</A>
			</div>
			<div className={'sm:text-sm'} 
				dangerouslySetInnerHTML={{__html: parseMarkdown((metas.assetDescription || 'No description found.').replaceAll('{{token}}', vault.token.symbol))}} />
		</div>
		{activeStrategies.map(strategy => <div key={strategy.address}>
			<div className={'flex items-center gap-2'}>
				<div className={'font-mono font-bold'}>{formatPercent((strategy.debtRatio?.toNumber() || 0) / 10_000)}</div>
				<div className={'font-bold'}>{`~ ${strategy.name}`}</div>
			</div>
			<div className={'sm:text-sm'} 
				dangerouslySetInnerHTML={{__html: parseMarkdown(getDescription(strategy.address).replaceAll('{{token}}', vault.token.symbol))}} />
		</div>)}
	</div>;
}
