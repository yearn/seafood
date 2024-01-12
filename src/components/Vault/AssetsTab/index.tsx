import React from 'react';
import VaultAssets from './VaultAssets';
import StrategyAssets from './StrategyAssets';
import {useVault} from '../VaultProvider';

export default function AssetsTab() {
	const {vault} = useVault();
	if(vault.type === 'vault') return <VaultAssets vault={vault} />;
	if(vault.type === 'strategy') return <StrategyAssets vault={vault} />;
	return <></>;
}
