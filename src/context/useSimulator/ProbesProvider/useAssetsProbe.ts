import {useMemo} from 'react';
import {useVaults} from '../../useVaults';
import {useSimulatorStatus} from '../SimulatorStatusProvider';
import {SimulationResult} from '../../../tenderly';
import {BigNumber, ethers, providers} from 'ethers';
import {useBlocks} from '../BlocksProvider';
import {Probe, ProbeResults} from './useProbes';
import {GetVaultContract} from '../../../ethereum/EthHelpers';
import {Vault} from '../../useVaults/types';
import {getTvlSeries} from '../../../utils/vaults';

export interface AssetsOutput {
	vault: string,
	totalAssets: BigNumber
	totalDebt: BigNumber
}

export function useAssetsProbeResults(vault: Vault | undefined, startResults: ProbeResults[], stopResults: ProbeResults[]) {
	const {computeVaultDr} = useBlocks();
	const vaultDebtRatio = computeVaultDr(vault);

	const start = useMemo(() => {
		if(!vault) return undefined;
		return (startResults
			.find(r => r.name === 'assets')
			?.output as AssetsOutput[])
			?.find(o => o.vault === vault.address);
	}, [vault, startResults]);

	const stop = useMemo(() => {
		if(!vault) return undefined;
		return (stopResults
			.find(r => r.name === 'assets')
			?.output as AssetsOutput[])
			?.find(o => o.vault === vault.address);
	}, [vault, stopResults]);

	const totalAssets = useMemo(() => {
		if(start && stop) {
			return {
				simulated: true,
				value: stop.totalAssets,
				delta: stop.totalAssets.sub(start.totalAssets)
			};
		} else {
			return {
				simulated: false,
				value: vault?.totalAssets || ethers.constants.Zero,
				delta: ethers.constants.Zero
			};
		}		
	}, [vault, start, stop]);

	const tvl = useMemo(() => {
		if(!vault) return {simulated: false, value: 0, delta: 0};
		const tvls = getTvlSeries(vault);
		const latest = tvls.length > 0 ? tvls[tvls.length - 1] : 0;
		if(totalAssets.delta.gt(0)) {
			const delta = totalAssets.delta.div(BigNumber.from(10).pow(vault.decimals)).toNumber() * vault.price;
			return {
				simulated: true,
				value: latest + delta,
				delta: delta
			};
		} else {
			return {
				simulated: false,
				value: latest,
				delta: 0
			};
		}
	}, [vault, totalAssets]);

	const freeAssets = useMemo(() => {
		const starting = vault?.totalAssets?.sub(vault.totalDebt || 0) || ethers.constants.Zero;
		if(stop) {
			const ending = stop.totalAssets.sub(stop.totalDebt);
			return {
				simulated: true,
				value: ending,
				delta: ending.sub(starting)
			};
		} else {
			return {
				simulated: false,
				value: starting,
				delta: ethers.constants.Zero
			};
		}
	}, [vault, stop]);

	const allocated = useMemo(() => {
		if((vault?.totalAssets || ethers.constants.Zero).eq(0)) 
			return {simulated: false, value: 0, delta: 0};
		if(stop) {
			const starting = (vault?.debtRatio?.toNumber() || 0) / 10_000;
			const ending = stop.totalDebt.mul(10_000).div(stop.totalAssets).toNumber() / 10_000;
			return {
				simulated: true,
				value: ending,
				delta: ending - starting
			};
		} else {
			return {
				simulated: vaultDebtRatio.touched,
				value: vaultDebtRatio.value / 10_000,
				delta: vaultDebtRatio.delta / 10_000
			};
		}
	}, [vault, vaultDebtRatio, stop]);

	return {start, stop, totalAssets, tvl, freeAssets, allocated};
}

export default function useAssetsProbe() {
	const {vaults} = useVaults();
	const {blocks} = useBlocks();
	const {setStatus} = useSimulatorStatus();

	const vaultsToProbe = useMemo(() => {
		return vaults.filter(vault => {
			const addresses = [vault.address, ...vault.strategies.map(s => s.address)];
			return blocks.some(block => addresses.includes(block.contract));
		});
	}, [blocks, vaults]);

	const probe = useMemo(() => {
		return {
			name: 'assets',

			start: async (provider: providers.JsonRpcProvider) => {
				setStatus('Measure starting assets');
				const results = [] as AssetsOutput[];
				for(const vault of vaultsToProbe) {
					const contract = await GetVaultContract(vault.address, provider, vault.version);
					const totalAssets = await contract.totalAssets();
					const totalDebt = await contract.totalDebt();
					results.push({
						vault: vault.address,
						totalAssets,
						totalDebt
					});
				}
				return {name: 'assets', output: results};
			},

			stop: async (_results: SimulationResult[], provider: providers.JsonRpcProvider) => {
				setStatus('Measure assets flow');
				const results = [] as AssetsOutput[];
				for(const vault of vaultsToProbe) {
					const contract = await GetVaultContract(vault.address, provider, vault.version);
					const totalAssets = await contract.totalAssets();
					const totalDebt = await contract.totalDebt();
					results.push({
						vault: vault.address,
						totalAssets,
						totalDebt
					});
				}
				return {name: 'assets', output: results};
			}
		} as Probe;
	}, [vaultsToProbe, setStatus]);

	return probe;
}
