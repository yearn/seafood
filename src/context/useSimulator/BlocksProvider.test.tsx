import {act, RenderHookResult} from '@testing-library/react';
import {renderHook} from '@testing-library/react'
import {providers} from 'ethers';
import BlocksProvider, {BlockManager, useBlockManager} from './BlocksProvider';
import {Strategy, Vault} from '../useVaults/types';
import {getChain} from '../../utils/utils';

const mocks = {
	vault: {
		address: '0xdA816459F1AB5631232FE5e97a05BBBb94970c95',
		governance: '0xFEB4acf3df3cDEA7399794D0869ef76A6EfAff52',
		version: '0.4.3'
	} as Vault,
	strategy: {
		a: { address: '0x1676055fE954EE6fc388F9096210E5EbE0A9070c' } as Strategy,
		b: { address: '0x9E3aeF1fb3dE09b8c46247fa707277b7331406B5' } as Strategy
	}
};

describe('<BlocksProvider />', () => {

	let provider: providers.JsonRpcProvider;
	beforeAll(() => {
		provider = new providers.JsonRpcProvider(getChain(1).providers[0]);
	});

	let renderBlockManager: RenderHookResult<BlockManager, unknown>;
	beforeEach(() => {
		renderBlockManager = renderHook(() => useBlockManager(), {
			wrapper: ({children}) => <BlocksProvider provider={provider}>{children}</BlocksProvider>
		});
	});

	function blockManager() {
		return renderBlockManager.result.current;
	}

	it('Adds harvest blocks', async () => {
		await act(async () => {
			await blockManager().addHarvest(mocks.vault, mocks.strategy.a);
		});
		const blocks = blockManager().blocks;
		expect(blocks.length).toEqual(1);
		expect(blocks[0].contract.address).toEqual(mocks.strategy.a.address);
		expect(blocks[0].functionCall.name).toEqual('harvest');
		expect(blocks[0].functionInput.length).toEqual(0);
	});

	it('Only keeps one harvest per strategy', async () => {
		await act(async () => {
			await blockManager().addHarvest(mocks.vault, mocks.strategy.a);
			await blockManager().addHarvest(mocks.vault, mocks.strategy.a);
			await blockManager().addHarvest(mocks.vault, mocks.strategy.b);
		});
		expect(blockManager().blocks.length).toEqual(2);
	});

	it('Removes harvest blocks', async () => {
		await act(async () => {
			await blockManager().addHarvest(mocks.vault, mocks.strategy.a);
			await blockManager().removeHarvest(mocks.strategy.a);
		});
		expect(blockManager().blocks.length).toEqual(0);
	});

	it('Adds updateDebtRatio blocks', async () => {
		await act(async () => {
			await blockManager().addDebtRatioUpdate(mocks.vault, mocks.strategy.a, 100);
		});
		const blocks = blockManager().blocks;
		expect(blocks.length).toEqual(2);
		expect(blocks[0].contract.address).toEqual(mocks.vault.address);
		expect(blocks[0].functionCall.name).toEqual('updateStrategyDebtRatio');
		expect(blocks[0].functionInput.length).toEqual(2);
		expect(blocks[0].functionInput[0]).toEqual(mocks.strategy.a.address);
		expect(blocks[0].functionInput[1]).toEqual(100);
		expect(blocks[1].contract.address).toEqual(mocks.strategy.a.address);
		expect(blocks[1].functionCall.name).toEqual('harvest');
		expect(blocks[1].functionInput.length).toEqual(0);
	});

	it('Only keeps latest debt ratio update per strategy', async () => {
		await act(async () => {
			await blockManager().addDebtRatioUpdate(mocks.vault, mocks.strategy.a, 100);
			await blockManager().addDebtRatioUpdate(mocks.vault, mocks.strategy.a, 200);
		});
		expect(blockManager().blocks.length).toEqual(2);
		expect(blockManager().blocks[0].functionInput[1]).toEqual(200);
	});

	it('Removes debt ratio update blocks', async () => {
		await act(async () => {
			await blockManager().addDebtRatioUpdate(mocks.vault, mocks.strategy.a, 100);
			await blockManager().removeDebtRatioUpdate(mocks.vault, mocks.strategy.a);
		});
		expect(blockManager().blocks.length).toEqual(0);
	});

	it('Orders debt ratio updates in ascending order', async () => {
		await act(async () => {
			await blockManager().addDebtRatioUpdate(mocks.vault, mocks.strategy.a, 200);
			await blockManager().addDebtRatioUpdate(mocks.vault, mocks.strategy.b, 100);
		});
		expect(blockManager().blocks.length).toEqual(4);
		expect(blockManager().blocks[0].functionInput[0]).toEqual(mocks.strategy.b.address);
		expect(blockManager().blocks[0].functionInput[1]).toEqual(100);
		expect(blockManager().blocks[2].functionInput[0]).toEqual(mocks.strategy.a.address);
		expect(blockManager().blocks[2].functionInput[1]).toEqual(200);
	});
});
