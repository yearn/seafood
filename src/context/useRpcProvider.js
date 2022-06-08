import {ethers} from 'ethers';
import React, {useContext, createContext, useState} from 'react';

function keepAlive(provider) {
	provider.keepAliveInterval = setInterval(async () => {
		await provider.send('eth_blockNumber');
	}, 55_000);
}

const RPCProvider = createContext();
export const RPCProviderContextApp = ({children}) => {
	const [defaultProvider, setDefaultProvider] = useState();
	const [fantomProvider, setFantomProvider] = useState();	
	const [tenderlyProvider, setTenderly] = useState(null);

	async function initProviders() {
		const eth_nodes = [];
		eth_nodes.push(new ethers.providers.WebSocketProvider(
			process.env.REACT_APP_ETH_WS_PROVIDER, {
				name: 'ethereum',
				chainId: 1
			}));
		if(process.env.REACT_APP_ETH_WS_PROVIDER_BACKUP){
			eth_nodes.push(new ethers.providers.WebSocketProvider(
				process.env.REACT_APP_ETH_WS_PROVIDER_BACKUP, {
					name: 'ethereum',
					chainId: 1
				}));
		}

		const ftm_nodes = [];
		ftm_nodes.push(new ethers.providers.WebSocketProvider(
			process.env.REACT_APP_FTM_WS_PROVIDER3, {
				name: 'fantom',
				chainId: 250
			}));

		let promises = [];
		for(let provider of eth_nodes){
			let promise = new Promise(function(resolve){
				provider.detectNetwork().then(() => resolve(provider));
			});
			promises.push(promise);
		}
		let def = await Promise.race(promises);
		eth_nodes.filter(n => n !== def).forEach(n => n.destroy());
		setDefaultProvider(def);
		keepAlive(def);

		promises = [];
		for(let provider of ftm_nodes){
			let promise = new Promise(function(resolve){
				provider.detectNetwork().then(() => resolve(provider));
			});
			promises.push(promise);
		}
		let fan = await Promise.race(promises);
		ftm_nodes.filter(n => n !== fan).forEach(n => n.destroy());
		setFantomProvider(fan);
		keepAlive(fan);

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
