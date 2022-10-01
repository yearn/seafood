import {ethers} from 'ethers';
import React, {useContext, createContext, useState, useEffect, useCallback} from 'react';
import config from '../config';

function createHttpsProvider(url, name, chainId) {
	return new ethers.providers.JsonRpcProvider(url, {name, chainId});
}

function createProvider(url, name, chainId) {
	if(url.startsWith('https')) {
		return createHttpsProvider(url, name, chainId);
	} else {
		throw `Unsupported protocol, ${url}`;
	}
}

async function raceAll(promises) {
	const result = await Promise.race(promises);
	await Promise.all(promises);
	return result;
}

async function bestProvider(rpcs, name, chainId) {
	const providers = [];
	rpcs.filter(rpc => rpc).forEach(rpc => {
		providers.push(createProvider(rpc, name, chainId));
	});

	if(providers.length === 1) return providers[0];

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
	const [providers, setProviders] = useState([]);

	useEffect(() => {
		(async () => {
			const freshProviders = [];
			for(const chain of config.chains) {
				if(chain.providers.length) {
					freshProviders.push(await bestProvider(chain.providers, chain.name, chain.id));
				}
			}
			setProviders(freshProviders);
		})();
	}, []);

	const providerByChainId = useCallback((chainId) => {
		return providers.find(p => p.network.chainId === chainId);
	}, [providers]);

	return (
		<RPCProvider.Provider value={{providers, providerByChainId}}>
			{children}
		</RPCProvider.Provider>
	);
};

export const useRpcProvider = () => useContext(RPCProvider);
export default useRpcProvider;
