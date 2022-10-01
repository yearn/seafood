import React from 'react';
import useScrollOverpass from '../../context/useScrollOverpass';
import {A} from '../controls';
import Chip from './Chip';
import CopyButton from './CopyButton';
import {getAddressExplorer, truncateAddress, formatTokens, formatPercent} from '../../utils/utils';
import {useVault} from './VaultProvider';
import {useSimulator} from './SimulatorProvider';
import SimulatorStatus from './SimulatorStatus';

function Divider() {
	return <div className={'hidden sm:block -mx-2 text-xl text-secondary-200 dark:text-secondary-900'}>{''}</div>;
}

export default function Summary() {
	const {vault, token, provider} = useVault();
	const {overpassClassName} = useScrollOverpass();
	const simulator = useSimulator();

	return <div className={`
		sticky top-0 z-10
		flex flex-col 
		${overpassClassName}`}>

		<div className={'w-full sm:w-fit py-5 pr-4 sm:py-2 sm:pr-0 flex items-center justify-between gap-4'}>
			<div className={'w-1/5 sm:w-0'}></div>
			<Chip className={`bg-${provider.network.name}`}>{provider.network.name}</Chip>
			<Chip className={'bg-primary-400 dark:bg-primary-900'}>{vault.version}</Chip>
			<A target={'_blank'} href={getAddressExplorer(provider.network.chainId, vault.address)} rel={'noreferrer'}>
				{truncateAddress(vault.address)}
			</A>
			<CopyButton clip={vault.address}></CopyButton>
		</div>

		<div className={'sm:w-fit px-4 flex flex-col sm:flex-row sm:items-center sm:gap-8'}>
			<h1 className={'font-bold text-5xl'}>{vault.name}</h1>

			<Divider />

			<div className={'grid grid-cols-3 sm:gap-x-2'}>
				<div className={''}>{'Total Assets'}</div>
				<div className={'text-right'}>{'Free Assets '}</div>
				<div className={'text-right'}>{'Allocated'}</div>
				<div className={'font-mono'}>{formatTokens(vault.totalAssets, token.decimals, 2, true)}</div>
				<div className={'sm:pl-2 font-mono text-right'}>{(formatTokens(vault.totalAssets - vault.totalDebt, token.decimals, 2, true))}</div>
				<div className={'font-mono text-right'}>{formatPercent(vault.debtRatio/10_000, 0, '--')}</div>
			</div>

			<Divider />

			<div className={'grid grid-cols-3'}>
				<div className={'row-span-2 flex justify-start'}>{'Vault APR'}</div>
				<div className={'text-right'}>{'Before Fees'}</div>
				<div className={'text-right'}>{'After Fees'}</div>
				<div className={'font-mono text-primary-600 dark:text-primary-400 text-right'}>
					{formatPercent(simulator.vaultResults?.apr.beforeFee, 2, '--')}
				</div>
				<div className={'font-mono text-primary-600 dark:text-primary-400 text-right'}>
					{formatPercent(simulator.vaultResults?.apr.afterFee, 2, '--')}
				</div>
			</div>
		</div>

		<div className={'p-4'}>
			<SimulatorStatus />
		</div>

	</div>;
}