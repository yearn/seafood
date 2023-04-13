import {BigNumber, ethers, providers} from 'ethers';
import {useCallback, useMemo} from 'react';
import {getApyComputer, getSamples} from '../../../math/apy';
import {Apy} from '../../../math/apy/types';
import {GetVaultContract} from '../../../ethereum/EthHelpers';
import {fetchHarvestReports} from '../../../utils/vaults';
import {useVaults} from '../../useVaults';
import {Vault} from '../../useVaults/types';
import {Probe} from './useProbes';
import {computeDegradationTime} from '../../../utils/vaults';
import {useBlocks} from '../BlocksProvider';
import {SimulationResult} from '../../../tenderly';
import {useSimulatorStatus} from '../SimulatorStatusProvider';

export interface ApyOutput {
	vault: string,
	apy: Apy
}

export default function useApyProbe() {
	const {vaults} = useVaults();
	const {blocks} = useBlocks();
	const {setStatus} = useSimulatorStatus();

	const measureApy = useCallback(async (vault: Vault, provider: providers.JsonRpcProvider) => {
		const reports = await fetchHarvestReports(vault);
		const reportBlocks = reports.map((r: {block: string}) => parseInt(r.block)).sort();
		const samples = await getSamples(provider, reportBlocks);
		const computer = getApyComputer(vault.apy.type);
		const contract = await GetVaultContract(vault.address, provider, vault.version);
		return await computer.compute(vault, contract, samples);
	}, []);

	const vaultsToProbe = useMemo(() => {
		return vaults.filter(vault => {
			const addresses = [vault.address, ...vault.strategies.map(s => s.address)];
			return blocks.some(block => addresses.includes(block.contract));
		});
	}, [blocks, vaults]);

	const runApyProbe = useCallback(async (provider: providers.JsonRpcProvider) => {
		const result = [] as ApyOutput[];
		for(const vault of vaultsToProbe) {
			result.push({
				vault: vault.address,
				apy: await measureApy(vault, provider)
			});
		}
		return result;
	}, [vaultsToProbe, measureApy]);

	const longestDegradationTime = useCallback(() => {
		return vaultsToProbe.map(v => computeDegradationTime(v)).reduce((a, b) => a.gt(b) ? a : b, BigNumber.from(0));
	}, [vaultsToProbe]);

	const probe = useMemo(() => {
		return {
			name: 'apy',

			start: async (provider: providers.JsonRpcProvider) => {
				setStatus('Compute current APYs');
				const result = await runApyProbe(provider);
				return {name: 'apy', output: result};
			},

			stop: async (_results: SimulationResult[], provider: providers.JsonRpcProvider) => {
				setStatus('Compute simulated APYs');
				const degradationTime = longestDegradationTime();
				await provider.send('evm_increaseTime', [ethers.utils.hexValue(degradationTime)]);
				await provider.send('evm_mine', []);
				const result = await runApyProbe(provider);
				return {name: 'apy', output: result};
			}
		} as Probe;
	}, [setStatus, runApyProbe, longestDegradationTime]);

	return probe;
}
