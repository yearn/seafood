import React, {createContext, ReactNode, useContext, useEffect, useMemo, useState} from 'react';
import {useParams} from 'react-router-dom';
import {useVaults} from '../../context/useVaults';
import useRpcProvider from '../../context/useRpcProvider';
import {GetVaultContract} from '../../ethereum/EthHelpers';
import {fetchHarvestReports, HarvestReport} from '../../utils/vaults';
import {Vault} from '../../context/useVaults/types';
import {Contract, providers} from 'ethers';

export interface VaultContext {
	loading: boolean,
	vault: Vault | undefined,
	contract: Contract | undefined,
	provider: providers.JsonRpcProvider | undefined,
	reports: HarvestReport[],
	reportBlocks: number[]
}

const	vaultContext = createContext<VaultContext>({} as VaultContext);

export const useVault = () => useContext(vaultContext);

export default function VaultProvider({children}: {children: ReactNode}) {
	const params = useParams();
	const {providers} = useRpcProvider();
	const {vaults} = useVaults();
	const [contract, setVaultRpc] = useState<Contract>();
	const [provider, setProvider] = useState<providers.JsonRpcProvider>();
	const [reports, setReports] = useState<HarvestReport[]>([] as HarvestReport[]);
	const [reportBlocks, setReportBlocks] = useState<number[]>([]);

	const vault = useMemo(() => {
		return vaults.find(v => v.address === params.address);
	}, [params, vaults]);

	const loading = useMemo(() => {
		return !vault || !provider || !reports;
	}, [vault, provider, reports]);

	useEffect(() => {
		if(vault) {
			const provider = providers.find((p: providers.JsonRpcProvider) => p.network.chainId == vault?.network.chainId);
			if(vault && provider) {
				setProvider(provider);
	
				GetVaultContract(vault.address, provider, vault.version).then(contract => {
					setVaultRpc(contract);
				});
	
				fetchHarvestReports(vault).then(reports => {
					setReports(reports);
					setReportBlocks(reports.map(r => parseInt(r.block)).sort());
				});
			}
		}
	}, [vault, providers]);

	return <vaultContext.Provider value={{
		loading,
		vault,
		contract,
		provider,
		reports,
		reportBlocks
	}}>
		{children}
	</vaultContext.Provider>;
}
