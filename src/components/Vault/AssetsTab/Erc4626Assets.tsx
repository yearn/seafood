import React from 'react';
import {Vault} from '../../../context/useVaults/types';
import {Row} from '../../controls';
import TvlBars from '../TvlBars';
import {useAssetsProbeResults} from '../../../context/useSimulator/ProbesProvider/useAssetsProbe';
import {useSimulator} from '../../../context/useSimulator';
import {Tokens} from '../../controls/Fields';

export default function Erc4626Assets({vault}: {vault: Vault}) {
	const simulator = useSimulator();
	const {totalAssets} = useAssetsProbeResults(vault, simulator.probeStartResults, simulator.probeStopResults);

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
		</div>
		<div className={'w-full pb-4 sm:my-0'}>
			{vault && <TvlBars vault={vault} />}
		</div>
	</div>;
}
