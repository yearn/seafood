import {providers} from 'ethers';
import React, {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {getApyComputer, getSamples} from '../../../apy';
import {Apy} from '../../../apy/types';
import {GetVaultContract} from '../../../ethereum/EthHelpers';
import {fetchHarvestReports} from '../../../utils/harvestReports';
import {useVaults} from '../../useVaults';
import {Vault} from '../../useVaults/types';
import {Block} from '../Blocks';
import {Probe, ProbesContext} from './useProbes';

export interface ApyProbeResult {
	vault: string,
	apy: Apy
}

export default function ProbesProvider({children}: {children: ReactNode}) {
	const [probes, setProbes] = useState<Probe[]>([]);
	const {vaults} = useVaults();

	const measureApy = useCallback(async (vault: Vault, provider: providers.JsonRpcProvider) => {
		const reports = await fetchHarvestReports(vault) as [{block: string}];
		const reportBlocks = reports.map((r: {block: string}) => parseInt(r.block)).sort();
		const samples = await getSamples(provider, reportBlocks);
		const computer = getApyComputer(vault.apy.type);
		const contract = await GetVaultContract(vault.address, provider, vault.version);
		return await computer.compute(vault, contract, samples);
	}, []);

	const runApyProbe = useCallback(async (blocks: Block[], provider: providers.JsonRpcProvider) => {
		const result = [];

		const vaultsThatNeedAProbing = vaults.filter(vault => {
			const addresses = [vault.address, ...vault.strategies.map(s => s.address)];
			return blocks.some(block => addresses.includes(block.contract.address));
		});

		for(const vault of vaultsThatNeedAProbing) {
			result.push({
				vault: vault.address,
				apy: await measureApy(vault, provider)
			});
		}

		return result;
	}, [vaults, measureApy]);

	const apyProbe = useMemo(() => {
		return {
			start: async (blocks: Block[], provider: providers.JsonRpcProvider) => {
				return await runApyProbe(blocks, provider);
			},
			stop: async (blocks: Block[], provider: providers.JsonRpcProvider) => {
				return await runApyProbe(blocks, provider);
			}
		};
	}, [runApyProbe]);

	useEffect(() => {
		setProbes([apyProbe]);
	}, [apyProbe]);

	return <ProbesContext.Provider value={{probes}}>
		{children}
	</ProbesContext.Provider>;
}
