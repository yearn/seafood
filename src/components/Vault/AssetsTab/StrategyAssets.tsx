import React, {useMemo} from 'react';
import {Vault} from '../../../context/useVaults/types';
import {FixedNumber} from 'ethers';
import {Row} from '../../controls';
import TvlBars from '../TvlBars';
import {useAssetsProbeResults} from '../../../context/useSimulator/ProbesProvider/useAssetsProbe';
import {useSimulator} from '../../../context/useSimulator';
import {Number, Percentage, Tokens} from '../../controls/Fields';

export default function StrategyAssets({vault}: {vault: Vault}) {
	const simulator = useSimulator();
	const {totalAssets} = useAssetsProbeResults(vault, simulator.probeStartResults, simulator.probeStopResults);

	const deployed = useMemo(() => {
		if(!vault.totalAssets || vault.totalAssets?.eq(0)) return 0;
		const totalIdle = FixedNumber.from(vault.totalIdle?.toString() || '0');
		const totalAssets = FixedNumber.from(vault.totalAssets?.toString() || '0');
		return (totalAssets.subUnsafe(totalIdle)).divUnsafe(totalAssets).toUnsafeFloat();
	}, [vault]);

	const idle = useMemo(() => {
		if(!vault.totalAssets || vault.totalAssets?.eq(0)) return 0;
		const totalIdle = FixedNumber.from(vault.totalIdle?.toString() || '0');
		const totalAssets = FixedNumber.from(vault.totalAssets?.toString() || '0');
		return totalIdle.divUnsafe(totalAssets).toUnsafeFloat();
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
			<Row label={'Deployed'} alt={true} heading={true}>
				<Percentage value={deployed} />
			</Row>
			<Row label={'Idle'}>
				<Percentage value={idle} />
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
