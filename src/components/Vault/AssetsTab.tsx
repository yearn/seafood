import React, {useMemo} from 'react';
import {useBlocks} from '../../context/useSimulator/BlocksProvider';
import {Vault} from '../../context/useVaults/types';
import {FixedNumber, ethers} from 'ethers';
import {Row} from '../controls';
import {formatPercent, formatTokens} from '../../utils/utils';
import {BPS} from '../../constants';
import TvlBars from './TvlBars';

export default function AssetsTab({vault}: {vault: Vault}) {
	const {computeVaultDr} = useBlocks();

	const vaultDebtRatio = computeVaultDr(vault);

	const allocated = useMemo(() => {
		if((vault.totalAssets || ethers.constants.Zero).eq(0)) return 0;
		return vaultDebtRatio.value / BPS.toUnsafeFloat();
	}, [vault, vaultDebtRatio]);

	const utilization = useMemo(() => {
		if(!vault) return 0;
		if((vault.depositLimit || ethers.constants.Zero).eq(0)) return NaN;
		const availableDepositLimit = FixedNumber.from(vault.availableDepositLimit || 0);
		const depositLimit = FixedNumber.from(vault.depositLimit);
		return 1 - availableDepositLimit.divUnsafe(depositLimit).toUnsafeFloat();
	}, [vault]);

	return <div className={'flex flex-col sm:gap-8'}>
		<div className={'w-full flex flex-col gap-4'}>
			<Row label={'Total Assets'} className={'font-bold text-2xl'}>
				<div className={'font-bold font-mono text-3xl text-right'}>{formatTokens(vault.totalAssets, vault.token.decimals, 2, true)}</div>
			</Row>
			<Row label={'Free assets'} alt={true} heading={true}>
				<div className={'font-mono text-right'}>{formatTokens(vault.totalAssets?.sub(vault.totalDebt || 0), vault.token.decimals, 2, true)}</div>
			</Row>
			<Row label={'Allocated'}>
				<div className={
					`font-mono text-right 
					${vaultDebtRatio.touched ? 'text-primary-600 dark:text-primary-400' : ''}`}>
					{formatPercent(allocated, 2, '--')}
				</div>
			</Row>
			<Row label={'Deposit limit'} alt={true}>
				<div className={'font-mono text-right'}>{formatTokens(vault.depositLimit, vault.token.decimals, 2, true)}</div>
			</Row>
			<Row label={'Utilization'}>
				<div className={'font-mono text-right'}>{formatPercent(utilization, 2)}</div>
			</Row>
		</div>
		<div className={'w-full py-4 sm:my-0'}>
			{vault && <TvlBars vault={vault} />}
		</div>
	</div>;
}
