import React, {createContext, ReactNode, useCallback, useContext, useState} from 'react';
import {providers} from 'ethers';
import {FunctionFragment} from 'ethers/lib/utils';
import {Strategy, Vault} from '../useVaults/types';
import {Block, functions, makeDebtRatioUpdateBlock, makeHarvestBlock} from './Blocks';

export interface BlockManager {
	blocks: Block[],
	addHarvest: (vault: Vault, strategy: Strategy) => void,
	removeHarvest: (strategy: Strategy) => void,
	addDebtRatioUpdate: (vault: Vault, strategy: Strategy, debtRatio: number) => void,
	removeDebtRatioUpdate: (vault: Vault, strategy: Strategy) => void
}

function functionFragmentToSignature(fragment: FunctionFragment) {
	return `${fragment.name}(${fragment.inputs.map(input => input.type).join(',')})`;
}

function findHarvestIndex(blocks: Block[], strategy: Strategy) {
	return blocks.findIndex(b =>
		b.contract.address == strategy.address
		&& functionFragmentToSignature(b.functionCall) === functions.strategies.harvest.signature
	);
}

function findDebtRatioUpdateIndex(blocks: Block[], vault: Vault, strategy: Strategy) {
	return blocks.findIndex(b =>
		b.contract.address == vault.address
		&& functionFragmentToSignature(b.functionCall) === functions.vaults.updateDebtRatio.signature
		&& b.functionInput[0] == strategy.address
	);
}

export function findDebtRatioUpdate(blocks: Block[], vault: Vault, strategy: Strategy) {
	const index = findDebtRatioUpdateIndex(blocks, vault, strategy);
	return index > -1 ? blocks[index] : null;
}

export const	BlocksContext = createContext<BlockManager>({} as BlockManager);

export const useBlockManager = () => useContext(BlocksContext);

export default function BlocksProvider({
	provider, 
	children
}: {
	provider: providers.JsonRpcProvider, 
	children: ReactNode
}) {
	const [blocks, setBlocks] = useState<Block[]>([]);

	const addHarvest = useCallback(async (vault: Vault, strategy: Strategy) => {
		const block = await makeHarvestBlock(vault, strategy, provider);
		setBlocks(current => {
			const index = findHarvestIndex(current, strategy);
			if(index > -1) return current;
			return [...current, block];
		});
	}, [setBlocks, provider]);

	const removeHarvest = useCallback((strategy: Strategy) => {
		setBlocks(current => {
			const index = findHarvestIndex(current, strategy);
			if(index < 0) return current;
			const result = [...current];
			result.splice(index, 1);
			return result;
		});
	}, [setBlocks]);

	const addDebtRatioUpdate = useCallback(async (vault: Vault, strategy: Strategy, debtRatio: number) => {
		const debtRatioUpdate = await makeDebtRatioUpdateBlock(vault, strategy, debtRatio, provider);
		const harvest = await makeHarvestBlock(vault, strategy, provider);
		setBlocks(current => {
			const result = [...current];
			const debtRatioUpdateIndex = findDebtRatioUpdateIndex(result, vault, strategy);
			if(debtRatioUpdateIndex > -1) result.splice(debtRatioUpdateIndex, 1);
			const harvestIndex = findHarvestIndex(result, strategy);
			if(harvestIndex > -1) result.splice(harvestIndex, 1);

			let insertIndex = result.length - 1;
			for(let i = 0; i < result.length; i++) {
				const block = result[i];
				if(functionFragmentToSignature(block.functionCall) === functions.vaults.updateDebtRatio.signature
				&& block.functionInput[1] as number > debtRatio) {
					insertIndex = i;
					break;
				}
			}

			result.splice(insertIndex, 0, harvest);
			result.splice(insertIndex, 0, debtRatioUpdate);
			return result;
		});
	}, [setBlocks, provider]);

	const removeDebtRatioUpdate = useCallback((vault: Vault, strategy: Strategy) => {
		setBlocks(current => {
			const result = [...current];
			const debtRatioUpdateIndex = findDebtRatioUpdateIndex(result, vault, strategy);
			if(debtRatioUpdateIndex < 0) return current;
			result.splice(debtRatioUpdateIndex, 1);
			const harvestIndex = findHarvestIndex(result, strategy);
			if(harvestIndex > -1) result.splice(harvestIndex, 1);
			return result;
		});
	}, [setBlocks]);

	return <BlocksContext.Provider value={{
		blocks,
		addHarvest,
		removeHarvest,
		addDebtRatioUpdate,
		removeDebtRatioUpdate
	}}>
		{children}
	</BlocksContext.Provider>;
}
