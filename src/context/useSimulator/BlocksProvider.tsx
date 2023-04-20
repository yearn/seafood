import React, {createContext, ReactNode, useCallback, useContext, useMemo, useState} from 'react';
import {Strategy, Vault} from '../useVaults/types';
import {Block, functions, makeDebtRatioUpdateBlock, makeHarvestBlock, makeSetDoHealthCheckBlock} from './Blocks';

export interface Touched {
	touched: boolean,
	value: number,
	delta: number
}

export interface BlocksContext {
	blocks: Block[],
	blocksForVault: (vault: Vault) => Block[],
	addSetDoHealthCheck: (vault: Vault, strategy: Strategy, doHealthCheck: boolean) => Promise<void>,
	removeSetDoHealthCheck: (vault: Vault, strategy: Strategy) => void,
	addHarvest: (vault: Vault, strategy: Strategy) => Promise<void>,
	removeHarvest: (vault: Vault, strategy: Strategy) => void,
	addDebtRatioUpdate: (vault: Vault, strategy: Strategy, debtRatio: number) => Promise<void>,
	removeDebtRatioUpdate: (vault: Vault, strategy: Strategy) => void,
	extractDrUpdates: (vault: Vault) => {[address: string]: number},
	computeVaultDr: (vault: Vault | null | undefined) => Touched,
	reset: () => void
}

function findSetDoHealthCheckIndex(blocks: Block[], strategy: Strategy) {
	return blocks.findIndex(b =>
		b.contract == strategy.address
		&& b.call.signature === functions.strategies.setDoHealthCheck.signature
	);
}

export function findSetDoHealthCheck(blocks: Block[], strategy: Strategy) {
	const index = findSetDoHealthCheckIndex(blocks, strategy);
	return index > -1 ? blocks[index] : null;	
}

function findHarvestIndex(blocks: Block[], strategy: Strategy) {
	return blocks.findIndex(b =>
		b.contract == strategy.address
		&& b.call.signature === functions.strategies.harvest.signature
	);
}

export function findHarvest(blocks: Block[], strategy: Strategy) {
	const index = findHarvestIndex(blocks, strategy);
	return index > -1 ? blocks[index] : null;
}

function findDebtRatioUpdateIndex(blocks: Block[], vault: Vault, strategy: Strategy) {
	return blocks.findIndex(b =>
		b.contract == vault.address
		&& b.call.signature === functions.vaults.updateDebtRatio.signature
		&& b.call.input[0] == strategy.address
	);
}

export function findDebtRatioUpdate(blocks: Block[], vault: Vault, strategy: Strategy) {
	const index = findDebtRatioUpdateIndex(blocks, vault, strategy);
	return index > -1 ? blocks[index] : null;
}

export const blocksContext = createContext<BlocksContext>({} as BlocksContext);

export const useBlocks = () => useContext(blocksContext);

export default function BlocksProvider({children}: {children: ReactNode}) {
	const [blocksByVault, setBlocksByVault] = useState<{[key: string]: Block[]}>({});

	const blocks = useMemo(() => {
		return Object.keys(blocksByVault).map(key => blocksByVault[key]).flat();
	}, [blocksByVault]);

	const setBlocks = useCallback((vault: Vault, setter: (current: Block[]) => Block[]) => {
		setBlocksByVault(current => {
			const result = {...current};
			result[vault.address] = setter(result[vault.address] || []);
			return result;
		});
	}, [setBlocksByVault]);

	const blocksForVault = useCallback((vault: Vault) => {
		return blocksByVault[vault.address] || [];
	}, [blocksByVault]);

	const addSetDoHealthCheck = useCallback(async (vault: Vault, strategy: Strategy, doHealthCheck: boolean) => {
		const block = await makeSetDoHealthCheckBlock(vault, strategy, doHealthCheck);
		setBlocks(vault, current => {
			const index = findSetDoHealthCheckIndex(current, strategy);
			if(index > -1) return current;
			const harvestIndex = findHarvestIndex(current, strategy);
			if(harvestIndex > -1) {
				const result = [...current];
				result.splice(harvestIndex, 0, block);
				return result;
			} else {
				return [...current, block];
			}
		});
	}, [setBlocks]);

	const removeSetDoHealthCheck = useCallback((vault: Vault, strategy: Strategy) => {
		setBlocks(vault, current => {
			const index = findSetDoHealthCheckIndex(current, strategy);
			if(index < 0) return current;
			const result = [...current];
			result.splice(index, 1);
			return result;
		});
	}, [setBlocks]);

	const addHarvest = useCallback(async (vault: Vault, strategy: Strategy) => {
		const block = await makeHarvestBlock(vault, strategy);
		setBlocks(vault, current => {
			const index = findHarvestIndex(current, strategy);
			if(index > -1) return current;
			const setDoHealthCheckIndex = findSetDoHealthCheckIndex(current, strategy);
			if(setDoHealthCheckIndex > -1 && current.length > 1) {
				const result = [...current];
				result.splice(setDoHealthCheckIndex + 1, 0, block);
				return result;
			} else {
				return [...current, block];
			}
		});
	}, [setBlocks]);

	const removeHarvest = useCallback((vault: Vault, strategy: Strategy) => {
		setBlocks(vault, current => {
			const index = findHarvestIndex(current, strategy);
			if(index < 0) return current;
			const result = [...current];
			result.splice(index, 1);
			return result;
		});
	}, [setBlocks]);

	const addDebtRatioUpdate = useCallback(async (vault: Vault, strategy: Strategy, debtRatio: number) => {
		const debtRatioUpdate = await makeDebtRatioUpdateBlock(vault, strategy, debtRatio);
		const harvest = await makeHarvestBlock(vault, strategy);
		setBlocks(vault, current => {
			const result = [...current];
			const debtRatioUpdateIndex = findDebtRatioUpdateIndex(result, vault, strategy);
			if(debtRatioUpdateIndex > -1) result.splice(debtRatioUpdateIndex, 1);
			const harvestIndex = findHarvestIndex(result, strategy);
			if(harvestIndex > -1) result.splice(harvestIndex, 1);
			const setDoHealthCheck = findSetDoHealthCheck(current, strategy);
			if(setDoHealthCheck) result.splice(findSetDoHealthCheckIndex(current, strategy), 1);

			let insertIndex = result.length - 1;
			for(let i = 0; i < result.length; i++) {
				const block = result[i];
				if(block.call.signature === functions.vaults.updateDebtRatio.signature
				&& (block.meta?.['delta'] as number) > (debtRatioUpdate.meta?.['delta'] as number)) {
					insertIndex = i - 1;
					break;
				}
			}

			insertIndex++;
			result.splice(insertIndex, 0, harvest);
			if(setDoHealthCheck) result.splice(insertIndex, 0, setDoHealthCheck);
			result.splice(insertIndex, 0, debtRatioUpdate);
			return result;
		});
	}, [setBlocks]);

	const removeDebtRatioUpdate = useCallback((vault: Vault, strategy: Strategy) => {
		setBlocks(vault, current => {
			const result = [...current];
			const debtRatioUpdateIndex = findDebtRatioUpdateIndex(result, vault, strategy);
			if(debtRatioUpdateIndex < 0) return current;
			result.splice(debtRatioUpdateIndex, 1);
			const harvestIndex = findHarvestIndex(result, strategy);
			if(harvestIndex > -1) result.splice(harvestIndex, 1);
			return result;
		});
	}, [setBlocks]);

	const extractDrUpdates = useCallback((vault: Vault) => {
		const result = {} as {[address: string]: number};
		blocks.filter(b => {
			return b.contract === vault.address 
			&& b.call.signature === functions.vaults.updateDebtRatio.signature;
		}).forEach(b => {
			result[b.call.input[0] as string] = b.call.input[1] as number;
		});
		return result;
	}, [blocks]);

	const computeVaultDr = useCallback((vault: Vault | null | undefined) => {
		if(!vault) return {} as Touched;
		const drUpdates = extractDrUpdates(vault);
		const debtRatio = vault.withdrawalQueue.map((s: Strategy) => {
			if(drUpdates[s.address] !== undefined) {
				return drUpdates[s.address];
			} else if(s.debtRatio) {
				return s.debtRatio.toNumber();
			} else {
				return 0;
			}
		}).reduce((a: number, b: number) => a + b, 0);
		return {
			touched: Boolean(Object.keys(drUpdates).length),
			value: debtRatio,
			delta: debtRatio - (vault.debtRatio?.toNumber() || 0),
		};
	}, [extractDrUpdates]);

	const reset = useCallback(() => {
		setBlocksByVault({});
	}, [setBlocksByVault]);

	return <blocksContext.Provider value={{
		blocks,
		blocksForVault,
		addSetDoHealthCheck,
		removeSetDoHealthCheck,
		addHarvest,
		removeHarvest,
		addDebtRatioUpdate,
		removeDebtRatioUpdate,
		extractDrUpdates,
		computeVaultDr,
		reset
	}}>
		{children}
	</blocksContext.Provider>;
}
