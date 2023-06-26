import {useMemo} from 'react';
import {useSimulatorStatus} from '../SimulatorStatusProvider';
import {SimulationResult} from '../../../tenderly';
import {BigNumber, FixedNumber, ethers, providers} from 'ethers';
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
		const actual = vault?.totalAssets?.sub(vault.totalDebt || 0) || ethers.constants.Zero;
		if(stop) {
			const simulated = stop.totalAssets.sub(stop.totalDebt);
			return {
				simulated: true,
				value: simulated,
				delta: simulated.sub(actual)
			};
		} else {
			return {
				simulated: false,
				value: actual,
				delta: ethers.constants.Zero
			};
		}
	}, [vault, stop]);

	const deployed = useMemo(() => {
		if((vault?.totalAssets || ethers.constants.Zero).eq(0)) {
			return {simulated: false, value: 0, delta: 0};
		}

		const totalDebt = FixedNumber.from(vault?.totalDebt?.toString() || '0');
		const totalAssets = FixedNumber.from(vault?.totalAssets?.toString() || '0');
		const actual = totalDebt.divUnsafe(totalAssets).toUnsafeFloat();

		if(stop) {
			const totalSimulatedDebt = FixedNumber.from(stop.totalDebt.toString());
			const totalSimulatedAssets = FixedNumber.from(stop.totalAssets.toString());
			const simulated = totalSimulatedDebt.divUnsafe(totalSimulatedAssets).toUnsafeFloat();
			return {
				simulated: true,
				value: simulated,
				delta: simulated - actual
			};
		} else {
			return {
				simulated: false,
				value: actual,
				delta: 0
			};
		}
	}, [vault, stop]);

	return {start, stop, totalAssets, tvl, freeAssets, deployed};
}

export default function useAssetsProbe() {
	const {setStatus} = useSimulatorStatus();

	const probe = useMemo(() => {
		return {
			name: 'assets',

			start: async (vaults: Vault[], provider: providers.JsonRpcProvider) => {
				setStatus('Measure assets');
				const results = [] as AssetsOutput[];
				for(const vault of vaults) {
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

			stop: async (_results: SimulationResult[], vaults: Vault[], provider: providers.JsonRpcProvider) => {
				setStatus('Measure asset flows');
				const results = [] as AssetsOutput[];
				for(const vault of vaults) {
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
	}, [setStatus]);

	return probe;
}
