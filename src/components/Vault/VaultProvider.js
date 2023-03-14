import React, {createContext, useContext, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import useLocalStorage from '../../utils/useLocalStorage';
import {useVaults} from '../../context/useVaults';
import useRpcProvider from '../../context/useRpcProvider';
import {Erc20Info, GetVaultContract} from '../../ethereum/EthHelpers';
import {fetchHarvestReports} from '../../utils/harvestReports';

const	VaultContext = createContext();
export const useVault = () => useContext(VaultContext);
export default function VaultProvider({children}) {
	const params = useParams();
	const {providers} = useRpcProvider();
	const {vaults} = useVaults();
	const [vault, setVault] = useState();
	const [vaultRpc, setVaultRpc] = useState();
	const [provider, setProvider] = useState();
	const [token, setToken] = useState();
	const [reports, setReports] = useState([]);
	const [reportBlocks, setReportBlocks] = useState([]);
	const [showHarvestChart, setShowHarvestChart] = useLocalStorage('vault.showHarvestChart', false);
	const loading = !vault || !provider || !token || !reports;

	useEffect(() => {
		const vault = vaults.find(v => v.address === params.address);
		const provider = providers.find(p => p.network.chainId == vault?.network.chainId);
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

	return <VaultContext.Provider value={{
		loading,
		vault,
		vaultRpc,
		provider,
		token,
		reports,
		reportBlocks,
		showHarvestChart,
		toggleHarvestChart: () => setShowHarvestChart(current => !current)
	}}>
		{children}
	</VaultContext.Provider>;
}
