import {act, RenderHookResult} from '@testing-library/react';
import {renderHook} from '@testing-library/react'
import BlocksProvider, {BlocksContext, useBlocks} from './BlocksProvider';
import {Strategy, Vault} from '../useVaults/types';

const mocks = {
	vault: { 
		a: {
			address: '0xdA816459F1AB5631232FE5e97a05BBBb94970c95',
			governance: '0xFEB4acf3df3cDEA7399794D0869ef76A6EfAff52',
			version: '0.4.3',
			network: {chainId: 1},
			withdrawalQueue: [
				{ address: '0x1676055fE954EE6fc388F9096210E5EbE0A9070c', network: {chainId: 1} } as Strategy,
				{ address: '0x9E3aeF1fb3dE09b8c46247fa707277b7331406B5', network: {chainId: 1} } as Strategy,
				{ address: '0xF9fDc2B5F60355A237deb8BD62CC117b1C907f7b', network: {chainId: 1} } as Strategy
			]
		} as Vault,
		b: {
			address: '0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE',
			governance: '0xFEB4acf3df3cDEA7399794D0869ef76A6EfAff52',
			version: '0.4.3',
			network: {chainId: 1},
			withdrawalQueue: [
				{ address: '0x97D868b5C2937355Bf89C5E5463d52016240fE86', network: {chainId: 1} } as Strategy,
				{ address: '0x7C2b9DB2Ae5aCC6fAC2Fd6cE9b01A5EB4bDD1309', network: {chainId: 1} } as Strategy,
				{ address: '0x66f7b6E7EB858075d6F2c5615F22659a1A20f6D6', network: {chainId: 1} } as Strategy
			]
		} as Vault
	}
};

describe('<BlocksProvider />', () => {

	let render: RenderHookResult<BlocksContext, unknown>;
	beforeEach(() => {
		render = renderHook(() => useBlocks(), {
			wrapper: ({children}) => <BlocksProvider>{children}</BlocksProvider>
		});
	});

	test('Adds harvest blocks', async () => {
		await act(async () => {
			await render.result.current.addHarvest(mocks.vault.a, mocks.vault.a.withdrawalQueue[0]);
		});
		const blocks = render.result.current.blocks;
		expect(blocks.length).toEqual(1);

		expect(blocks[0].contract).toEqual(mocks.vault.a.withdrawalQueue[0].address);
		expect(blocks[0].call.signature).toEqual('harvest()');
		expect(blocks[0].call.input.length).toEqual(0);
	});

	test('Only keeps one harvest per strategy', async () => {
		await act(async () => {
			await render.result.current.addHarvest(mocks.vault.a, mocks.vault.a.withdrawalQueue[0]);
			await render.result.current.addHarvest(mocks.vault.a, mocks.vault.a.withdrawalQueue[0]);
			await render.result.current.addHarvest(mocks.vault.a, mocks.vault.a.withdrawalQueue[1]);
		});
		expect(render.result.current.blocks.length).toEqual(2);
	});

	test('Removes harvest blocks', async () => {
		await act(async () => {
			await render.result.current.addHarvest(mocks.vault.a, mocks.vault.a.withdrawalQueue[0]);
			await render.result.current.removeHarvest(mocks.vault.a, mocks.vault.a.withdrawalQueue[0]);
		});
		expect(render.result.current.blocks.length).toEqual(0);
	});

	test('Adds updateDebtRatio blocks', async () => {
		await act(async () => {
			await render.result.current.addDebtRatioUpdate(mocks.vault.a, mocks.vault.a.withdrawalQueue[0], 100);
			await render.result.current.addDebtRatioUpdate(mocks.vault.a, mocks.vault.a.withdrawalQueue[1], 200);
		});
		const {blocks} = render.result.current;
		expect(blocks.length).toEqual(4);

		expect(blocks[0].contract).toEqual(mocks.vault.a.address);
		expect(blocks[0].call.signature).toEqual('updateStrategyDebtRatio(address,uint256)');
		expect(blocks[0].call.input.length).toEqual(2);
		expect(blocks[0].call.input[0]).toEqual(mocks.vault.a.withdrawalQueue[0].address);
		expect(blocks[0].call.input[1]).toEqual(100);

		expect(blocks[1].contract).toEqual(mocks.vault.a.withdrawalQueue[0].address);
		expect(blocks[1].call.signature).toEqual('harvest()');
		expect(blocks[1].call.input.length).toEqual(0);

		expect(blocks[2].call.input[0]).toEqual(mocks.vault.a.withdrawalQueue[1].address);
		expect(blocks[2].call.input[1]).toEqual(200);

		expect(blocks[3].contract).toEqual(mocks.vault.a.withdrawalQueue[1].address);
		expect(blocks[3].call.signature).toEqual('harvest()');
		expect(blocks[3].call.input.length).toEqual(0);
	});

	test('Orders debt ratio updates by delta ascending order', async () => {
		await act(async () => {
			await render.result.current.addDebtRatioUpdate(mocks.vault.a, mocks.vault.a.withdrawalQueue[0], 200);
			await render.result.current.addDebtRatioUpdate(mocks.vault.a, mocks.vault.a.withdrawalQueue[1], 100);
		});

		const {blocks} = render.result.current;
		expect(blocks.length).toEqual(4);

		expect(blocks[0].call.input[0]).toEqual(mocks.vault.a.withdrawalQueue[1].address);
		expect(blocks[0].call.input[1]).toEqual(100);

		expect(blocks[2].call.input[0]).toEqual(mocks.vault.a.withdrawalQueue[0].address);
		expect(blocks[2].call.input[1]).toEqual(200);
	});

	test('Only keeps latest debt ratio update per strategy', async () => {
		await act(async () => {
			await render.result.current.addDebtRatioUpdate(mocks.vault.a, mocks.vault.a.withdrawalQueue[0], 100);
			await render.result.current.addDebtRatioUpdate(mocks.vault.a, mocks.vault.a.withdrawalQueue[0], 200);
		});
		expect(render.result.current.blocks.length).toEqual(2);
		expect(render.result.current.blocks[0].call.input[1]).toEqual(200);
	});

	test('Removes debt ratio update blocks', async () => {
		await act(async () => {
			await render.result.current.addDebtRatioUpdate(mocks.vault.a, mocks.vault.a.withdrawalQueue[0], 100);
			await render.result.current.removeDebtRatioUpdate(mocks.vault.a, mocks.vault.a.withdrawalQueue[0]);
		});
		expect(render.result.current.blocks.length).toEqual(0);
	});

	test('Extracts lists of DR updates', async () => {
		await act(async () => {
			await render.result.current.addDebtRatioUpdate(mocks.vault.a, mocks.vault.a.withdrawalQueue[0], 1);
			await render.result.current.addDebtRatioUpdate(mocks.vault.a, mocks.vault.a.withdrawalQueue[1], 2);
		});
		const updates = render.result.current.extractDrUpdates(mocks.vault.a);
		expect(Object.keys(updates).length).toEqual(2);
		expect(updates[mocks.vault.a.withdrawalQueue[0].address]).toEqual(1);
		expect(updates[mocks.vault.a.withdrawalQueue[1].address]).toEqual(2);
	});

	test('Resets blocks', async () => {
		await act(async () => {
			await render.result.current.addDebtRatioUpdate(mocks.vault.a, mocks.vault.a.withdrawalQueue[0], 1);
			await render.result.current.reset();
		});
		expect(render.result.current.blocks.length).toEqual(0);
	});

	test('Orders blocks across multiple vaults', async () => {
		await act(async () => {
			await render.result.current.addDebtRatioUpdate(mocks.vault.a, mocks.vault.a.withdrawalQueue[0], 200);
			await render.result.current.addDebtRatioUpdate(mocks.vault.b, mocks.vault.b.withdrawalQueue[0], 200);
			await render.result.current.addDebtRatioUpdate(mocks.vault.a, mocks.vault.a.withdrawalQueue[1], 100);
			await render.result.current.addDebtRatioUpdate(mocks.vault.b, mocks.vault.b.withdrawalQueue[1], 100);
		});

		const {blocks} = render.result.current;
		expect(blocks.length).toEqual(8);
		expect(blocks[0].call.input[0]).toEqual(mocks.vault.a.withdrawalQueue[1].address);
		expect(blocks[0].call.input[1]).toEqual(100);

		expect(blocks[2].call.input[0]).toEqual(mocks.vault.a.withdrawalQueue[0].address);
		expect(blocks[2].call.input[1]).toEqual(200);

		expect(blocks[4].call.input[0]).toEqual(mocks.vault.b.withdrawalQueue[1].address);
		expect(blocks[4].call.input[1]).toEqual(100);

		expect(blocks[6].call.input[0]).toEqual(mocks.vault.b.withdrawalQueue[0].address);
		expect(blocks[6].call.input[1]).toEqual(200);
	});

	// // TODO
	// test('Only adds blocks for one network at a time', async () => {
	// 	expect(false).toBeTruthy();
	// });
});
