import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {GetStrategyContract, GetVaultContract} from '../../ethereum/EthHelpers';
import {useVault} from './VaultProvider';
import tenderly from '../../tenderly';
import {ethers} from 'ethers';
import {estimateBlockHeight} from '../../utils/defillama';

const	SimulatorContext = createContext();
export const useSimulator = () => useContext(SimulatorContext);
export default function SimulatorProvider({children}) {
	const {vault, provider} = useVault();
	const [vaultContract, setVaultContract] = useState();
	const [debtRatioUpdates, setDebtRatioUpdates] = useState({});
	const [simulatingAll, setSimulatingAll] = useState(false);
	const [simulatingStrategy, setSimulatingStrategy] = useState({});
	const [vaultResults, setVaultResults] = useState();
	const [strategyResults, setStrategyResults] = useState([]);
	const [codeNotifications, setCodeUpdates] = useState(false);

	useEffect(() => {
		if(vault && provider) {
			GetVaultContract(vault.address, provider).then(contract => setVaultContract(contract));
		}
	}, [vault, provider]);

	useEffect(() => {
		if(!vault) return;

		let any = false;
		let aprBeforeFees = 0;
		let aprAfterFees = 0;

		for(const strategy of vault.strategies) {
			const results = strategyResults[strategy.address];
			if(results?.status === 'ok') {
				any = true;
				if(isFinite(results.output.apr.beforeFee) && isFinite(results.output.apr.afterFee)) {
					aprBeforeFees += results.output.apr.beforeFee * strategy.totalDebt;
					aprAfterFees += results.output.apr.afterFee * strategy.totalDebt;
				}
			}
		}

		if(any) {
			setVaultResults({
				apr: {
					beforeFee: aprBeforeFees / vault.totalAssets,
					afterFee: aprAfterFees / vault.totalAssets
				}
			});
		} else {
			setVaultResults(null);
		}
	}, [vault, strategyResults, setVaultResults]);

	const computeStrategyFlow = useCallback((events) => {
		const strategyReported = events.find(e => e.name === 'StrategyReported');
		return {
			profit: strategyReported.args.loss.mul(-1).add(strategyReported.args.gain),
			debt: strategyReported.args.debtPaid.mul(-1).add(strategyReported.args.debtAdded)
		};
	}, []);

	const computeStrategyApr = useCallback((strategy, nextStrategyState) => {
		if(!nextStrategyState) return {beforeFee: 0, afterFee: 0};

		if(strategy.totalDebt.eq(0)) {
			if(strategy.estimatedTotalAssets.gt(0)) {
				return {beforeFee: Infinity, afterFee: Infinity};
			} else {
				return {beforeFee: 0, afterFee: 0};
			}
		}

		const profit = nextStrategyState.totalGain - strategy.totalGain;
		const loss = nextStrategyState.totalLoss - strategy.totalLoss;

		const pnlToDebt = (loss > profit)
			? -1 * loss / strategy.totalDebt
			: profit / strategy.totalDebt;

		const hoursInAYear = 24 * 365;
		const hourseSinceLastReport = (Date.now() / 1000 - strategy.lastReport) / 60 / 60;
		const annualizedPnlToDebt = pnlToDebt * hoursInAYear / hourseSinceLastReport;

		const performanceFee = vault.performanceFee / 10_000;
		const managementFee = vault.managementFee / 10_000;
		const delegatedToDebt = strategy.delegatedAssets / strategy.totalDebt;

		let annualizedPnlToDebtAfterFees = 
			annualizedPnlToDebt * (1 - performanceFee) 
			- managementFee * (1 - delegatedToDebt);

		annualizedPnlToDebtAfterFees = Math.max(annualizedPnlToDebtAfterFees, 0);

		return {beforeFee: annualizedPnlToDebt, afterFee: annualizedPnlToDebtAfterFees};
	}, [vault]);

	const getPps = useCallback(async (blocktime) => {
		console.log('getPps', blocktime);
		const blocks = [{
			contract: vaultContract,
			signer: vault.governance,
			functionCall: vaultContract.interface.functions['pricePerShare()'],
			functionInput: []
		}];

		if(blocktime) {
			const height = await estimateBlockHeight(vault.chainId, blocktime);
			const provider = await tenderly.createProvider(vault.chainId, height);
			const results = await tenderly.simulate(blocks, provider);
			return results[0].output[0];
		} else {
			const provider = await tenderly.createProvider(vault.chainId);
			const results = await tenderly.simulate(blocks, provider);
			return results[0].output[0];
		}
	}, [vault, vaultContract]);

	const getApy = useCallback(async () => {
		const day = 24 * 60 * 60;
		const now = Date.now() / 1000;
		console.log('lesgo..');
		const pps = {
			current: await getPps(),
			[-7]: await getPps(now - 7 * day),
			[-30]: await getPps(now - 30 * day)
		};
		console.log('pps', pps);

		const apy = {
			[-7]: pps.current.sub(pps[-7]).mul(10_000).div(pps[-7]).mul(Math.floor(100 * 365 / 7)).div(100),
			[-30]: pps.current.sub(pps[-30]).mul(10_000).div(pps[-30]).mul(Math.floor(100 * 365 / 30)).div(100)
		};

		console.log('apy', apy);
		console.log(apy[-7] / 100, '%');
		console.log(apy[-30] / 100, '%');

	}, [getPps]);

	const harvest = useCallback(async (strategy, tenderlyProvider) => {
		setSimulatingStrategy(current => ({...current, [strategy.address]: true}));

		if(!tenderlyProvider) {
			tenderlyProvider = await tenderly.createProvider(provider.network.chainId);
		}

		const strategyContract = GetStrategyContract(strategy.address, provider);
		const debtRatioUpdate = debtRatioUpdates[strategy.address];
		const blocks = [];

		if(debtRatioUpdate !== undefined) {
			blocks.push({
				contract: vaultContract,
				signer: vault.governance,
				functionCall: vaultContract.interface.functions['updateStrategyDebtRatio(address,uint256)'],
				functionInput: [strategy.address, debtRatioUpdate]
			});
		}

		blocks.push({
			contract: strategyContract,
			signer: vault.governance,
			functionCall: strategyContract.interface.functions['harvest()'],
			functionInput: []
		});

		blocks.push({
			contract: vaultContract,
			signer: vault.governance,
			functionCall: vaultContract.interface.functions['strategies(address)'],
			functionInput: [strategy.address]
		});

		const results = await tenderly.simulate(blocks, tenderlyProvider);

		const eventsAbi = [
			'event StrategyUpdateDebtRatio(address indexed strategy, uint256 debtRatio)',
			'event Harvested(uint256 profit, uint256 loss, uint256 debtPayment, uint256 debtOutstanding)',
			'event StrategyReported(address indexed strategy, uint256 gain, uint256 loss, uint256 debtPaid, uint256 totalGain, uint256 totalLoss, uint256 totalDebt, uint256 debtAdded, uint256 debtRatio)'
		];
		const eventsInterface = new ethers.utils.Interface(eventsAbi);

		const rawEvents = results
			.map(r => r.output?.events ? [...r.output.events] : [])
			.flat();

		const events = [];
		for(let i = 0; i < rawEvents.length; i++) {
			const rawEvent = rawEvents[i];
			try {
				const log = eventsInterface.parseLog({topics: rawEvent.topics, data: rawEvent.data});
				events.push({...rawEvent, ...log});
			} catch(warning) { 
				// warning
			}
		}

		const firstFailedBlock = results.find(r => r.status === 'error');
		if(firstFailedBlock) {
			setStrategyResults(current => ({...current, [strategy.address]: {
				status: 'error', simulationUrl: firstFailedBlock.simulationUrl, output: null
			}}));
		} else {
			const nextStrategyState = results.at(-1).output;
			setStrategyResults(current => ({...current, [strategy.address]: {
				status: 'ok', simulationUrl: results.at(-2).simulationUrl, output: {
					...nextStrategyState,
					apr: computeStrategyApr(strategy, nextStrategyState),
					flow: computeStrategyFlow(events),
					events
				}
			}}));
		}

		setSimulatingStrategy(current => ({...current, [strategy.address]: false}));
	}, [vault, provider, vaultContract, debtRatioUpdates, computeStrategyApr, computeStrategyFlow]);

	const harvestAll = useCallback(async () => {
		setSimulatingAll(true);
		const tenderlyProvider = await tenderly.createProvider(provider.network.chainId);
		for(let strategy of vault.strategies) {
			await harvest(strategy, tenderlyProvider);
		}
		setSimulatingAll(false);
	}, [vault, provider, setSimulatingAll, harvest]);

	const updateDebtRatio = useCallback((strategy, debtRatio) => {
		setDebtRatioUpdates(current => {
			const update = strategy.debtRatio.eq(debtRatio) ? undefined : debtRatio;
			setCodeUpdates(update || false);
			return {...current, [strategy.address]: update};
		});
	}, []);

	return <SimulatorContext.Provider value={{
		debtRatioUpdates,
		simulatingAll,
		simulatingStrategy,
		vaultResults,
		strategyResults,
		codeNotifications, 
		getApy,
		harvest,
		harvestAll,
		updateDebtRatio,
		resetCodeNotifications: () => setCodeUpdates(false),
	}}>
		{children}
	</SimulatorContext.Provider>;
}