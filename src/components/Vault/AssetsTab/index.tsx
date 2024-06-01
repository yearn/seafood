import React from 'react';
import VaultAssets from './VaultAssets';
import StrategyAssets from './StrategyAssets';
import {useVault} from '../VaultProvider';
import Erc4626Assets from './Erc4626Assets';

export default function AssetsTab() {
	const {vault} = useVault();
	if(!vault.yearn) return <Erc4626Assets vault={vault} />;
	if(vault.type === 'vault') return <VaultAssets vault={vault} />;
	if(vault.type === 'strategy') return <StrategyAssets vault={vault} />;
	return <></>;
}
