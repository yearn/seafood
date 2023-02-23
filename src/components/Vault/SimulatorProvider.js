import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';
import {GetStrategyContract, GetVaultContract} from '../../ethereum/EthHelpers';
import {useVault} from './VaultProvider';
import tenderly from '../../tenderly';
import {BigNumber, ethers} from 'ethers';
import {getApyComputer, getSamples} from '../../apy';

const	SimulatorContext = createContext();
export const useSimulator = () => useContext(SimulatorContext);
export default function SimulatorProvider({children}) {
	const {vault, provider, reportBlocks} = useVault();
	const [debtRatioUpdates, setDebtRatioUpdates] = useState({});
	const [simulatingAll, setSimulatingAll] = useState(false);
	const [simulatingStrategy, setSimulatingStrategy] = useState({});
	const [strategyResults, setStrategyResults] = useState([]);
	const [currentApy, setCurrentApy] = useState();
	const [nextApy, setNextApy] = useState();
	const [codeNotifications, setCodeUpdates] = useState(false);

	const engaged = useMemo(() => {
		if(simulatingStrategy) {
			return Object.keys(simulatingStrategy).length > 0;
		}
	}, [simulatingStrategy]);

	const apyComputer = useMemo(() => {
		if(vault) {
			return getApyComputer(vault.apy.type);
		}
	}, [vault]);

	const degradationTime = useMemo(() => {
		if((vault?.lockedProfitDegradation || ethers.constants.Zero).eq(0)) return 0;
		const degradationCoefficient = BigNumber.from('1000000000000000000');
		return degradationCoefficient.div(vault.lockedProfitDegradation);
	}, [vault]);

	const jumpToTotalProfitUnlock = useCallback(async (provider) => {
		await provider.send('evm_increaseTime', [ethers.utils.hexValue(degradationTime)]);
		await provider.send('evm_mine');		
	}, [degradationTime]);

	const computeVaultApy = useCallback(async (vaultRpc) => {
		const samples = await getSamples(vaultRpc.provider, reportBlocks);
		return await apyComputer.compute(vault, vaultRpc, samples);
	}, [vault, reportBlocks, apyComputer]);

	const computeStrategyFlow = useCallback((events) => {
		const strategyReported = events.find(e => e.name === 'StrategyReported');
		return {
			profit: strategyReported.args.loss.mul(-1).add(strategyReported.args.gain),
			debt: strategyReported.args.debtPaid.mul(-1).add(strategyReported.args.debtAdded)
		};
	}, []);

	function reset() {
		setStrategyResults([]);
		setCurrentApy();
		setNextApy();
	}

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

	const harvest = useCallback(async (strategy, tenderlyProvider) => {
		setSimulatingStrategy(current => ({...current, [strategy.address]: true}));

		const updateApy = !tenderlyProvider;
		if(!tenderlyProvider) {
			reset();
			tenderlyProvider = await tenderly.createProvider(provider.network.chainId);
		}

		const vaultRpc = await GetVaultContract(vault.address, tenderlyProvider, vault.version);
		if(updateApy) setCurrentApy(await computeVaultApy(vaultRpc));

		const strategyContract = GetStrategyContract(strategy.address, provider);
		const debtRatioUpdate = debtRatioUpdates[strategy.address];
		const blocks = [];

		if(debtRatioUpdate !== undefined) {
			blocks.push({
				contract: vaultRpc,
				signer: vault.governance,
				functionCall: vaultRpc.interface.functions['updateStrategyDebtRatio(address,uint256)'],
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
			contract: vaultRpc,
			signer: vault.governance,
			functionCall: vaultRpc.interface.functions['strategies(address)'],
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

		if(updateApy) {
			await jumpToTotalProfitUnlock(tenderlyProvider);
			setNextApy(await computeVaultApy(vaultRpc));
		}

		setSimulatingStrategy(current => ({...current, [strategy.address]: false}));
	}, [vault, provider, debtRatioUpdates, jumpToTotalProfitUnlock, computeVaultApy, computeStrategyApr, computeStrategyFlow]);

	const harvestAll = useCallback(async () => {
		reset();
		setSimulatingAll(true);
		const tenderlyProvider = await tenderly.createProvider(provider.network.chainId);
		const vaultRpc = await GetVaultContract(vault.address, tenderlyProvider, vault.version);
		setCurrentApy(await computeVaultApy(vaultRpc));

		for(let strategy of vault.withdrawalQueue) {
			await harvest(strategy, tenderlyProvider);
		}

		await jumpToTotalProfitUnlock(tenderlyProvider);
		setNextApy(await computeVaultApy(vaultRpc));
		setSimulatingAll(false);
	}, [vault, provider, jumpToTotalProfitUnlock, computeVaultApy, setSimulatingAll, harvest]);

	const updateDebtRatio = useCallback((strategy, debtRatio) => {
		setDebtRatioUpdates(current => {
			const update = strategy.debtRatio.eq(debtRatio) ? undefined : debtRatio;
			setCodeUpdates(update || false);
			return {...current, [strategy.address]: update};
		});
	}, []);

	const hasDebtRatioUpdates = useMemo(() => {
		if(!vault) return false;
		return vault.withdrawalQueue.some(strategy => {
			if(debtRatioUpdates[strategy.address] === undefined) false;
			else return strategy.debtRatio && !strategy.debtRatio?.eq(debtRatioUpdates[strategy.address]);
		});
	}, [vault, debtRatioUpdates]);

	const vaultDebtRatio = useMemo(() => {
		if(!vault) return 0;
		return vault.withdrawalQueue.map(s => {
			if(debtRatioUpdates[s.address] !== undefined) {
				return debtRatioUpdates[s.address];
			} else if(s.debtRatio) {
				return s.debtRatio.toNumber();
			} else {
				return 0;
			}
		}).reduce((a, b) => a + b, 0);
	}, [vault, debtRatioUpdates]);

	return <SimulatorContext.Provider value={{
		apyComputer,
		engaged,
		degradationTime,
		debtRatioUpdates,
		hasDebtRatioUpdates,
		vaultDebtRatio,
		simulatingAll,
		simulatingStrategy,
		currentApy,
		nextApy,
		strategyResults,
		codeNotifications,
		harvest,
		harvestAll,
		updateDebtRatio,
		resetCodeNotifications: () => setCodeUpdates(false),
	}}>
		{children}
	</SimulatorContext.Provider>;
}