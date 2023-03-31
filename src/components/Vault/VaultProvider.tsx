import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {useVaults} from '../../context/useVaults';
import useRpcProvider from '../../context/useRpcProvider';
import {Erc20Info, GetVaultContract} from '../../ethereum/EthHelpers';
import {fetchHarvestReports, HarvestReport} from '../../utils/vaults';
import {Vault} from '../../context/useVaults/types';
import {Contract, providers} from 'ethers';

export interface Erc20 {
	name: string,
	contract: Contract,
	address: string,
	decimals: number,
	url: string,
	dexScreener: string
}

export interface VaultContext {
	loading: boolean,
	vault: Vault | undefined,
	contract: Contract | undefined,
	provider: providers.JsonRpcProvider | undefined,
	token: Erc20 | undefined,
	reports: HarvestReport[],
	reportBlocks: number[]
}

const	vaultContext = createContext<VaultContext>({} as VaultContext);

export const useVault = () => useContext(vaultContext);

export default function VaultProvider({children}: {children: ReactNode}) {
	const params = useParams();
	const {providers} = useRpcProvider();
	const {vaults} = useVaults();
	const [vault, setVault] = useState<Vault>();
	const [contract, setVaultRpc] = useState<Contract>();
	const [provider, setProvider] = useState<providers.JsonRpcProvider>();
	const [token, setToken] = useState<Erc20>();
	const [reports, setReports] = useState<HarvestReport[]>([] as HarvestReport[]);
	const [reportBlocks, setReportBlocks] = useState<number[]>([]);
	const loading = !vault || !provider || !token || !reports;

	useEffect(() => {
		const vault = vaults.find(v => v.address === params.address);
		const provider = providers.find((p: providers.JsonRpcProvider) => p.network.chainId == vault?.network.chainId);
		if(vault && provider) {
			setVault(vault);
			setProvider(provider);

			GetVaultContract(vault.address, provider, vault.version).then(contract => {
				setVaultRpc(contract);
			});

			Erc20Info(vault.want, provider).then(token => {
				setToken(token);
			});

			fetchHarvestReports(vault).then(reports => {
				setReports(reports);
				setReportBlocks(reports.map(r => parseInt(r.block)).sort());
			});
		}
	}, [params, vaults, providers]);

	return <vaultContext.Provider value={{
		loading,
		vault,
		contract,
		provider,
		token,
		reports,
		reportBlocks
	}}>
		{children}
	</vaultContext.Provider>;
}
