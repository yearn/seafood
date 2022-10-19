import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import axios from 'axios';
import {BigNumber} from 'ethers';
import {Multicall} from 'ethereum-multicall';
import useSWR from 'swr';
import {vault043 as vault043Abi, strategy as strategyAbi} from '../interfaces/interfaces';
import useLocalStorage from '../utils/useLocalStorage';
import useRpcProvider from './useRpcProvider';
import config from '../config.json';

const yDaemonRequests = config.chains.map(chain => 
	`${config.ydaemon.url}/${chain.id}/vaults/all?strategiesCondition=inQueue&strategiesDetails=withDetails`);

const multifetch = async (...urls) => {
	return Promise.all(urls.map(url => 
		axios.get(url).then(response => response.data)
	));
};

const yDaemonVaultToSeafoodVault = (vault, chain) => ({
	address: vault.address,
	name: vault.name,
	network: {
		chainId: chain.id,
		name: chain.name
	},
	version: vault.version,
	want: vault.token.address,
	totalAssets: BigNumber.from(vault.tvl.total_assets),
	governance: vault.details.governance,
	totalDebt: undefined,
	decimals: vault.decimals,
	debtRatio: undefined,
	managementFee: BigNumber.from(vault.details.managementFee),
	performanceFee: BigNumber.from(vault.details.performanceFee),
	strategies: vault.strategies
		.sort((a, b) => a.details.withdrawalQueuePosition - b.details.withdrawalQueuePosition)
		.map(strategy => yDaemonStrategyToSeafoodStrategy(strategy, chain))
});

const yDaemonStrategyToSeafoodStrategy = (strategy, chain) => ({
	address: strategy.address,
	name: strategy.name,
	network: {
		chainId: chain.id,
		name: chain.name
	},
	delegatedAssets: BigNumber.from(strategy.details.delegatedAssets),
	estimatedTotalAssets: BigNumber.from(strategy.details.estimatedTotalAssets),
	performanceFee: strategy.details.performanceFee,
	activation: strategy.details.activation,
	debtRatio: strategy.details.debtRatio
		? BigNumber.from(strategy.details.debtRatio)
		: undefined,
	lastReport: strategy.details.lastReport,
	totalDebt: BigNumber.from(strategy.details.totalDebt),
	totalGain: BigNumber.from(strategy.details.totalGain),
	totalLoss: BigNumber.from(strategy.details.totalLoss)
});

const	AppContext = createContext();
export const useApp = () => useContext(AppContext);
export const AppProvider = ({children}) => {
	const {providers} = useRpcProvider();
	const [loading, setLoading] = useState(false);
	const [multicallLoading, setMulticallLoading] = useState(false);
	const [yDaemonCache, setYDaemonCache] = useLocalStorage('useapp-ydaemon', []);
	const [multicallCache, setMulticallCache] = useLocalStorage('useapp-multicall', [], {parseBigNumbers: true});
	const [cacheTimestamp, setCacheTimestamp] = useLocalStorage('useapp-timestamp', 0);
	const [vaults, setVaults] = useState([]);
	const [favoriteVaults, setFavoriteVaults] = useLocalStorage('favoriteVaults', []);
	const [favoriteStrategies, setFavoriteStrategies] = useLocalStorage('favoriteStrategies', []);

	const {
		data: yDaemonData, 
		error: yDaemonError, 
		mutate: yDaemonMutate
	} = useSWR(yDaemonRequests, multifetch);

	const syncCache = useCallback(() => {
		if(!loading) {
			yDaemonMutate(undefined);
		}
	}, [loading, yDaemonMutate]);

	useEffect(() => {
		setYDaemonCache(yDaemonData);
		setMulticallLoading(true);
	}, [yDaemonData, setYDaemonCache, setMulticallLoading]);

	useEffect(() => {
		setLoading(!(yDaemonData || yDaemonError) || multicallLoading);
	}, [yDaemonData, yDaemonError, multicallLoading, setLoading]);

	useEffect(() => {
		if(!yDaemonCache || providers.length < config.chains.length) return;

		const multicallPromises = [];
		for(let [index, chain] of config.chains.entries()) {
			const provider = providers.find(p => p.network.chainId == chain.id);
			const multicall = new Multicall({ethersProvider: provider, tryAggregate: true});

			const vaults = yDaemonCache[index].map(vault => yDaemonVaultToSeafoodVault(vault, chain));
			const vaultMulticalls = vaults.map(vault => ({
				reference: vault.address,
				contractAddress: vault.address,
				abi: vault043Abi,
				calls: [
					{reference: 'totalDebt', methodName: 'totalDebt', methodParameters: []},
					{reference: 'debtRatio', methodName: 'debtRatio', methodParameters: []}
				]
			}));

			multicallPromises.push((async () => {
				const parsed = [];
				const multiresults = await multicall.call(vaultMulticalls);
				vaults.forEach(vault => {
					const results = multiresults.results[vault.address].callsReturnContext;
					parsed.push({
						chainId: chain.id,
						type: 'vault',
						address: vault.address,
						totalDebt: BigNumber.from(results[0].returnValues[0]),
						debtRatio: results[1].returnValues[0] ? BigNumber.from(results[1].returnValues[0]) : undefined
					});
				});
				return parsed;
			})());

			const strategies = vaults.map(vault => vault.strategies).flat();
			const strategyMulticalls = strategies.map(strategy => ({
				reference: strategy.address,
				contractAddress: strategy.address,
				abi: strategyAbi,
				calls: [
					{reference: 'lendStatuses', methodName: 'lendStatuses', methodParameters: []}
				]
			}));

			multicallPromises.push((async () => {
				const parsed = [];
				const multiresults = await multicall.call(strategyMulticalls);
				strategies.forEach(strategy => {
					const results = multiresults.results[strategy.address].callsReturnContext;
					if(results[0].returnValues?.length > 0) {
						parsed.push({
							chainId: chain.id,
							type: 'strategy',
							address: strategy.address,
							lendStatuses: results[0].returnValues.map(tuple => ({
								name: tuple[0],
								deposits: BigNumber.from(tuple[1]),
								apr: BigNumber.from(tuple[2]),
								address: tuple[3]
							}))
						});
					}
				});
				return parsed;
			})());
		}

		Promise.all(multicallPromises).then(results => {
			setMulticallCache(results.flat());
			setMulticallLoading(false);
			setCacheTimestamp(Date.now());
		});
	}, [yDaemonCache, providers, setMulticallCache, setMulticallLoading, setCacheTimestamp]);

	useEffect(() => {
		setVaults(current => {
			const refresh = yDaemonCache?.length > 0 ? [] : [...current];
			for(let [index, chain] of config.chains.entries()) {
				if(yDaemonCache?.length > 0) {
					const vaults = yDaemonCache[index].map(vault => yDaemonVaultToSeafoodVault(vault, chain));	
					refresh.push(...vaults);
				}

				const strategies = refresh.map(vault => vault.strategies).flat();
				const updates = multicallCache?.filter(u => u.chainId === chain.id);
				updates.forEach(update => {
					if(update.type === 'vault') {
						const vault = refresh.find(v => 
							v.network.chainId === chain.id 
							&& v.address === update.address);
						if(vault) {
							vault.totalDebt = update.totalDebt;
							vault.debtRatio = update.debtRatio;
						}
					} else if(update.type === 'strategy') {
						const strategy = strategies.find(s => 
							s.network.chainId === chain.id 
							&& s.address === update.address);
						if(strategy) {
							strategy.lendStatuses = update.lendStatuses;
						}
					}
				});
			}

			return refresh;
		});
	}, [yDaemonCache, multicallCache, setVaults]);

	return <AppContext.Provider value={{
		loading,
		vaults,
		cacheTimestamp,
		syncCache,
		favorites: {
			vaults: favoriteVaults,
			setVaults: setFavoriteVaults,
			strategies: favoriteStrategies,
			setStrategies: setFavoriteStrategies
		},
	}}>{children}</AppContext.Provider>;
};