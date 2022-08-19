import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {GetStrategyContract, GetVaultContract} from '../../ethereum/EthHelpers';
import {useVault} from './VaultProvider';
import tenderly from '../../tenderly';

const	SimulatorContext = createContext();
export const useSimulator = () => useContext(SimulatorContext);
export default function SimulatorProvider({children}) {
	const {vault, provider} = useVault();
	const [tenderlyProvider, setTenderlyProvider] = useState();
	const [vaultContract, setVaultContract] = useState();
	const [debtRatioUpdates, setDebtRatioUpdates] = useState({});
	const [simulatingAll, setSimulatingAll] = useState(false);
	const [simulatingStrategy, setSimulatingStrategy] = useState({});
	const [vaultResults, setVaultResults] = useState();
	const [strategyResults, setStrategyResults] = useState([]);
	const [codeNotifications, setCodeUpdates] = useState(false);

	useEffect(() => {
		if(provider) {
			tenderly.createProvider(provider.network.chainId).then(tenderlyProvider => {
				setTenderlyProvider(tenderlyProvider);
			});
		}
	}, [provider]);

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

		for(const strategy of vault.strats_detailed) {
			const results = strategyResults[strategy.address];
			if(results?.status === 'ok') {
				any = true;
				aprBeforeFees += results.output.apr.beforeFee * strategy.totalDebt;
				aprAfterFees += results.output.apr.afterFee * strategy.totalDebt;
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

	const computeStrategyApr = useCallback((strategy, newStrategyState) => {
		if(!newStrategyState) return {beforeFee: 0, afterFee: 0};

		if(strategy.totalDebt.eq(0)) {
			if(strategy.estimatedTotalAssets.gt(0)) {
				return {beforeFee: Infinity, afterFee: Infinity};
			} else {
				return {beforeFee: 0, afterFee: 0};
			}
		}

		const profit = newStrategyState.totalGain - strategy.totalGain;
		const loss = newStrategyState.totalLoss - strategy.totalLoss;

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

	const harvest = useCallback(async (strategy) => {
		setSimulatingStrategy(current => ({...current, [strategy.address]: true}));
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

		const firstFailedBlock = results.find(r => r.status === 'error');
		if(firstFailedBlock) {
			setStrategyResults(current => ({...current, [strategy.address]: {
				status: 'error', simulationUrl: firstFailedBlock.simulationUrl, output: null
			}}));
		} else {
			const newStrategyState = results.at(-1).output;
			setStrategyResults(current => ({...current, [strategy.address]: {
				status: 'ok', simulationUrl: results.at(-2).simulationUrl, output: {
					...newStrategyState,
					apr: computeStrategyApr(strategy, newStrategyState)
				}
			}}));
		}

		setSimulatingStrategy(current => ({...current, [strategy.address]: false}));
	}, [vault, provider, tenderlyProvider, vaultContract, debtRatioUpdates, computeStrategyApr]);

	const harvestAll = useCallback(async () => {
		setSimulatingAll(true);
		for(let strategy of vault.strats_detailed) {
			await harvest(strategy);
		}
		setSimulatingAll(false);
	}, [vault, setSimulatingAll, harvest]);

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
		harvest,
		harvestAll,
		updateDebtRatio,
		resetCodeNotifications: () => setCodeUpdates(false),
	}}>
		{children}
	</SimulatorContext.Provider>;
}