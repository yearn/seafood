import {ethers} from 'ethers';
import React, {useContext, createContext, useState} from 'react';

const RPCProvider = createContext();
export const RPCProviderContextApp = ({children}) => {
	const [defaultProvider, setDefaultProvider] = useState(new ethers.providers.WebSocketProvider(
		process.env.REACT_APP_ETH_WS_PROVIDER, {
			name: 'ethereum',
			chainId: 1
		}
	));
	const [fantomProvider, setFantomProvider] = useState(new ethers.providers.WebSocketProvider(
		process.env.REACT_APP_FTM_WS_PROVIDER3, {
			name: 'fantom',
			chainId: 250
		}
	));


	const def_network = {
		name: 'ethereum',
		chainId: 1
	};
	const eth_nodes = [];
	
	eth_nodes.push(new ethers.providers.WebSocketProvider(
		process.env.REACT_APP_ETH_WS_PROVIDER, def_network
	));
	if(process.env.REACT_APP_ETH_WS_PROVIDER_BACKUP){

		const n = new ethers.providers.WebSocketProvider(
			process.env.REACT_APP_ETH_WS_PROVIDER_BACKUP, def_network
		);
		eth_nodes.push(n);
	}

	const network = {
		name: 'fantom',
		chainId: 250
	};

	const ftm_nodes = [];
	
	ftm_nodes.push(new ethers.providers.WebSocketProvider(
		process.env.REACT_APP_FTM_WS_PROVIDER3, network
	));
	
	const [tenderlyProvider, setTenderly] = useState(null);

	async function initProviders() {
		let promises = [];
		for(let provider of eth_nodes){
			let promise = new Promise(function(resolve){
				provider.detectNetwork().then(() => resolve(provider));
			});
			promises.push(promise);
		}
		let def = await Promise.race(promises);
		setDefaultProvider(def);
		console.log(defaultProvider);
		

		promises = [];
		for(let provider of ftm_nodes){
			let promise = new Promise(function(resolve){
				provider.detectNetwork().then(() => resolve(provider));
			});
			promises.push(promise);
		}
		let fan = await Promise.race(promises);
		setFantomProvider(fan);

		return [def, fan];
	}

	function closeProvider() {
		setTenderly(null);
	}

	function setupTenderly(chainId) {
		console.log(chainId);
		const fork_base_url = process.env.REACT_APP_FORK_BASE_URL;
		const payload = {network_id: chainId.toString()};
		console.log('start');
		console.log(fork_base_url);
		fetch(fork_base_url, {
			method: 'POST',
			body: JSON.stringify(payload),
		})
			.then(res => res.json())
			.then(data => {
				console.log(data);
				console.log(data['simulation_fork']['id']);
				setTenderly(new ethers.providers.JsonRpcProvider(
					'https://rpc.tenderly.co/fork/' + data['simulation_fork']['id']
				));
				console.log(tenderlyProvider);
			});
	}


	return (
		<RPCProvider.Provider
			value={{
				initProviders,
				closeProvider,
				setupTenderly,
				tenderlyProvider,
				defaultProvider,
				fantomProvider
			}}
		>
			{children}
		</RPCProvider.Provider>
	);
};

export const useRpcProvider = () => useContext(RPCProvider);
export default useRpcProvider;
