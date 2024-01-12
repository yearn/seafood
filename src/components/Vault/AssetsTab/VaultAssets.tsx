import React, {useMemo} from 'react';
import {Vault} from '../../../context/useVaults/types';
import {FixedNumber, ethers} from 'ethers';
import {Row} from '../../controls';
import {formatPercent, formatTokens} from '../../../utils/utils';
import TvlBars from '../TvlBars';
import {useAssetsProbeResults} from '../../../context/useSimulator/ProbesProvider/useAssetsProbe';
import {useSimulator} from '../../../context/useSimulator';
import {Bps, Number, Percentage, Tokens} from '../../controls/Fields';
import {useBlocks} from '../../../context/useSimulator/BlocksProvider';

export default function VaultAssets({vault}: {vault: Vault}) {
	const {computeVaultDr} = useBlocks();
	const simulator = useSimulator();
	const vaultDebtRatio = computeVaultDr(vault);
	const {totalAssets, freeAssets, deployed} = useAssetsProbeResults(vault, simulator.probeStartResults, simulator.probeStopResults);

	const noDepositLimit = useMemo(() => {
		return vault.depositLimit.eq(0);
	}, [vault]);

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
				<div className={'flex items-center gap-2'}>
					{totalAssets.simulated && <Tokens
						simulated={true}
						value={totalAssets.delta}
						decimals={vault.token.decimals || 18}
						sign={true}
						format={'(%s)'}
						animate={true}
						className={'text-base'} />}
					<Tokens
						simulated={totalAssets.simulated}
						value={totalAssets.value}
						decimals={vault.token.decimals || 18}
						animate={true}
						className={'text-3xl'} />
				</div>
			</Row>
			<Row label={'Allocated'} alt={true} heading={true}>
				<div className={'flex items-center gap-2'}>
					{vaultDebtRatio.simulated && <Bps
						simulated={vaultDebtRatio.simulated}
						value={vaultDebtRatio.delta / 10_000}
						sign={true}
						format={'(%s)'}
						animate={true}
						className={'text-xs'} />}
					<Percentage
						simulated={vaultDebtRatio.simulated} 
						value={vaultDebtRatio.value / 10_000}
						animate={true} />
				</div>
			</Row>
			<Row label={'Deployed'}>
				<div className={'flex items-center gap-2'}>
					{deployed.simulated && <Percentage
						simulated={deployed.simulated}
						value={deployed.delta}
						sign={true}
						format={'(%s)'}
						animate={true}
						className={'text-xs'} />}
					<Percentage
						simulated={deployed.simulated}
						value={deployed.value}
						animate={true} />
				</div>
			</Row>
			<Row label={'Idle assets'} alt={true}>
				<div className={'flex items-center gap-2'}>
					{freeAssets.simulated && <Tokens
						simulated={freeAssets.simulated}
						value={freeAssets.delta}
						decimals={vault.token.decimals || 18}
						sign={true}
						format={'(%s)'}
						animate={true}
						className={'text-xs'} />}
					<Tokens 
						simulated={freeAssets.simulated} 
						value={freeAssets.value} 
						decimals={vault.token.decimals || 18}
						animate={true} />
				</div>
			</Row>
			<Row label={'Deposit limit'} 
				className={noDepositLimit ? 'attention-box' : 'border border-transparent'}
				title={noDepositLimit ? 'This vault cannot take deposits until its limit is raised.' : ''}>
				<div className={'font-mono text-right'}>{formatTokens(vault.depositLimit, vault.token.decimals, 2, true)}</div>
			</Row>
			<Row label={'Utilization'} alt={true}>
				<div className={'font-mono text-right'}>{formatPercent(utilization, 2)}</div>
			</Row>
			{vault.rewardsUsd > 0 && <Row label={'Rewards (USD)'}>
				<Number className={'font-bold'} value={vault.rewardsUsd} decimals={2} />
			</Row>}
		</div>
		<div className={'w-full pb-4 sm:my-0'}>
			{vault && <TvlBars vault={vault} />}
		</div>
	</div>;
}
