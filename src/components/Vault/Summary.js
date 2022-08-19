import React from 'react';
import useScrollOverpass from '../../context/useScrollOverpass';
import {A} from '../controls';
import Chip from './Chip';
import CopyButton from './CopyButton';
import {getAddressExplorer, truncateAddress, formatTokens, formatPercent} from '../../utils/utils';
import {useVault} from './VaultProvider';
import {useSimulator} from './SimulatorProvider';
import SimulatorStatus from './SimulatorStatus';

export default function Summary() {
	const {vault, token, provider} = useVault();
	const {overpassClassName} = useScrollOverpass();
	const simulator = useSimulator();

	return <div className={`
		sticky top-0 z-10
		flex flex-col sm:flex-row sm:items-center sm:justify-between
		${overpassClassName}`}>

		<div className={'w-full py-5 pr-4 flex items-center justify-between gap-4'}>
			<div className={'w-1/5'}></div>
			<Chip className={`bg-${provider.network.name}`}>{provider.network.name}</Chip>
			<Chip className={'bg-primary-400 dark:bg-primary-900'}>{vault.version}</Chip>
			<A target={'_blank'} href={getAddressExplorer(provider.network.chainId, vault.address)} rel={'noreferrer'}>
				{truncateAddress(vault.address)}
			</A>
			<CopyButton clip={vault.address}></CopyButton>
		</div>

		<div className={'px-4 flex flex-col'}>
			<h1 className={'font-bold text-5xl'}>{vault.name}</h1>
			<div className={'grid grid-cols-4'}>
				<div className={'col-span-2'}>{'Total Assets'}</div>
				<div className={'text-right'}>{'Free Assets '}</div>
				<div className={'text-right'}>{'Allocated'}</div>
				<div className={'col-span-2 font-mono'}>{formatTokens(vault.totalAssets, token.decimals)}</div>
				<div className={'font-mono text-right'}>{(formatTokens(vault.totalAssets - vault.totalDebt, token.decimals)).toLocaleString(undefined, {maximumFractionDigits:2})}</div>
				<div className={'font-mono text-right'}>{formatPercent(vault.debtRatio/10_000, 0)}</div>
			</div>

			<div className={'grid grid-cols-4'}>
				<div className={'col-span-2 row-span-2 flex justify-start'}>{'Vault APR'}</div>
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