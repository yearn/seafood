import axios from 'axios';
import React, {createContext, useContext, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import useLocalStorage from '../../utils/useLocalStorage';
import {useApp} from '../../context/useApp';
import useRpcProvider from '../../context/useRpcProvider';
import {Erc20Info} from '../../ethereum/EthHelpers';

const	VaultContext = createContext();
export const useVault = () => useContext(VaultContext);
export default function VaultProvider({children}) {
	const params = useParams();
	const {providers} = useRpcProvider();
	const {vaults} = useApp();
	const [vault, setVault] = useState();
	const [provider, setProvider] = useState();
	const [token, setToken] = useState();
	const [harvestHistory, setHarvestHistory] = useState();
	const [showHarvestChart, setShowHarvestChart] = useLocalStorage('vault.showHarvestChart', false);
	const loading = !vault || !provider || !token || !harvestHistory;

	useEffect(() => {
		const vault = vaults.find(v => v.address === params.address);
		const provider = providers.find(p => p.network.chainId == vault?.network.chainId);
		if(vault && provider) {
			setVault(vault);
			setProvider(provider);
			Erc20Info(vault.want, provider).then(token => {
				setToken(token);
			});

			const strategies = vault.strategies.map(strategy => strategy.address);
			axios.post('/api/getVaults/AllStrategyReports', strategies).then(response => {
				setHarvestHistory(response.data);
			});
		}
	}, [params, vaults, providers]);

	return <VaultContext.Provider value={{
		loading, 
		vault, 
		provider, 
		token, 
		harvestHistory,
		showHarvestChart, 
		toggleHarvestChart: () => setShowHarvestChart(current => !current)
	}}>
		{children}
	</VaultContext.Provider>;
}