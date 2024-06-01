import React, {ReactNode} from 'react';
import {Vault} from '../../context/useVaults/types';
import {A} from '../controls';
import {getAddressExplorer, truncateAddress} from '../../utils/utils';
import CopyButton from './CopyButton';
import Yearn from './Yearn';
import ScrollContainer from 'react-indiana-drag-scroll';

function Chip({className, children}: {className: string, children: ReactNode}) {
	return <div className={`
		px-2 py-1 ${className}
		group-hover:border-selected-500 group-hover:bg-selected-500
		dark:group-hover:border-selected-400 dark:group-hover:bg-selected-400
		group-hover:text-black
		whitespace-nowrap`}>
		{children}
	</div>;
}

export default function Chips({vault}: {vault: Vault}) {
	const displayType = vault.yearn ? vault.type === 'vault' ? 'vault' : 'tokenized strategy' : '4626';

	return <ScrollContainer className={'flex items-center w-full'}>
		<div className={'w-fit flex items-center justify-between gap-4 sm:gap-3'}>
			<Chip className={`
				bg-neutral-200/40 dark:bg-neutral-800/40
				border border-neutral-200 dark:border-neutral-800
				${vault.type === 'vault' ? '' : 'border-dashed text-neutral-600 dark:text-neutral-400'}
				`}>{displayType}</Chip>
			{vault.yearn && <Chip className={`
				bg-neutral-200/40 dark:bg-neutral-800/40
				border border-neutral-200 dark:border-neutral-800
				`}>{vault.version}</Chip>}		
			<Chip className={`
					bg-${vault.network.name}-40
					border border-${vault.network.name}
					`}>{vault.network.name}</Chip>
			<A target={'_blank'} href={getAddressExplorer(vault.network.chainId, vault.address)} rel={'noreferrer'}>
				{truncateAddress(vault.address)}
			</A>
			<CopyButton clip={vault.address}></CopyButton>
			{vault.yearn && <Yearn vault={vault} />}
		</div>
	</ScrollContainer>;
}
