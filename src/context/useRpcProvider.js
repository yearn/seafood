import {ethers} from 'ethers';
import React, {useContext, createContext, useState, useEffect} from 'react';
import Web3WsProvider from 'web3-providers-ws';

function makeSocketProvider(url, name, chainId) {
	return new ethers.providers.Web3Provider(
		new Web3WsProvider(url, {
			timeout: 30_000,
			clientConfig: {
				keepalive: true,
				keepaliveInterval: 55_000
			},
			reconnect: {
				auto: true,
				delay: 5000,
				maxAttempts: 5,
				onTimeout: false
			}
		}),
		{name, chainId});
}

async function raceAll(promises) {
	const result = await Promise.race(promises);
	await Promise.all(promises);
	return result;
}

async function bestProvider(rpcs, name, chainId) {
	const providers = [];
	rpcs.filter(rpc => rpc).forEach(rpc => {
		providers.push(makeSocketProvider(rpc, name, chainId));
	});

	const promises = [];
	providers.forEach(provider => {
		promises.push(new Promise(function(resolve){
			provider.detectNetwork().then(() => resolve(provider));
		}));
	});

	const result = await raceAll(promises);
	providers.filter(provider => provider !== result)
		.forEach(provider => provider.provider.disconnect());
	return result;
}

const RPCProvider = createContext();
export const RPCProviderContextApp = ({children}) => {
	const [defaultProvider, setDefaultProvider] = useState();
	const [fantomProvider, setFantomProvider] = useState();	
	const [tenderlyProvider, setTenderly] = useState(null);

	useEffect(() => {
		bestProvider([
			process.env.REACT_APP_ETH_WS_PROVIDER,
			process.env.REACT_APP_ETH_WS_PROVIDER_BACKUP
		], 'ethereum', 1).then(provider => {
			setDefaultProvider(provider);
		});

		bestProvider([
			process.env.REACT_APP_FTM_WS_PROVIDER3
		], 'fantom', 250).then(provider => {
			setFantomProvider(provider);			
		});
	}, []);

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
