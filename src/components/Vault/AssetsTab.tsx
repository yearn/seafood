import React, {useMemo} from 'react';
import {Vault} from '../../context/useVaults/types';
import {FixedNumber, ethers} from 'ethers';
import {Row} from '../controls';
import {formatPercent, formatTokens} from '../../utils/utils';
import TvlBars from './TvlBars';
import {useAssetsProbeResults} from '../../context/useSimulator/ProbesProvider/useAssetsProbe';
import {useSimulator} from '../../context/useSimulator';
import {Bps, Percentage, Tokens} from '../controls/Fields';

export default function AssetsTab({vault}: {vault: Vault}) {
	const simulator = useSimulator();
	const {totalAssets, freeAssets, allocated} = useAssetsProbeResults(vault, simulator.probeStartResults, simulator.probeStopResults);

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
						className={'text-base'} />}
					<Tokens
						simulated={totalAssets.simulated}
						value={totalAssets.value}
						decimals={vault.token.decimals || 18}
						className={'text-3xl'} />
				</div>
			</Row>
			<Row label={'Free assets'} alt={true} heading={true}>
				<div className={'flex items-center gap-2'}>
					{freeAssets.simulated && <Tokens
						simulated={freeAssets.simulated}
						value={freeAssets.delta}
						decimals={vault.token.decimals || 18}
						sign={true}
						format={'(%s)'}
						className={'text-xs'} />}
					<Tokens 
						simulated={freeAssets.simulated} 
						value={freeAssets.value} 
						decimals={vault.token.decimals || 18} />
				</div>
			</Row>
			<Row label={'Allocated'}>
				<div className={'flex items-center gap-2'}>
					{allocated.simulated && <Bps
						simulated={allocated.simulated}
						value={allocated.delta}
						sign={true}
						format={'(%s)'}
						className={'text-xs'} />}
					<Percentage
						simulated={allocated.simulated}
						value={allocated.value} />
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
