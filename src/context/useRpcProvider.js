import {ethers} from 'ethers';
import React, {useContext, createContext, useState} from 'react';

const RPCProvider = createContext();
export const RPCProviderContextApp = ({children}) => {
	const [useProvider, setUseProvider] = useState(null);

	const def_network = {
		name: 'ethereum',
		chainId: 1
	};
	const defaultProvider = new ethers.providers.WebSocketProvider(
		process.env.REACT_APP_ETH_WS_PROVIDER, def_network
	);
	const network = {
		name: 'fantom',
		chainId: 250
	};
	/*
	//console.log(base64.encode(process.env.REACT_APP_FTM_USER + ':' + process.env.REACT_APP_FTM_PASS));
	const urlInfo = {
		url: process.env.REACT_APP_FTM_WS_PROVIDER2,
		user: process.env.REACT_APP_FTM_USER,
		password: process.env.REACT_APP_FTM_PASS,
		//headers: {'Authorization': 'Basic ' + base64.encode(process.env.REACT_APP_FTM_USER + ':' + process.env.REACT_APP_FTM_PASS)			
		//}
	};
	const fantomProvider = new ethers.providers.JsonRpcProvider(
		urlInfo, network
	);*/

	const fantomProvider = new ethers.providers.WebSocketProvider(
		process.env.REACT_APP_FTM_WS_PROVIDER3, network
	);

	const [tenderlyProvider, setTenderly] = useState(null);

	function initProvider() {
		const provider = new ethers.providers.WebSocketProvider(
			process.env.REACT_APP_ETH_WS_PROVIDER
		);

		setTenderly(provider);
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
				useProvider,
				setUseProvider,
				initProvider,
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
