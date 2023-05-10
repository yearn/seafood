import {act, RenderHookResult} from '@testing-library/react';
import {renderHook, waitFor} from '@testing-library/react'
import axios from 'axios';
import {BigNumber, ethers, providers} from 'ethers';
import {Strategy, Vault} from '../useVaults/types';
import SimulatorProvider, {Simulator, useSimulator} from '.';
import config from '../../config.json';
import {ReactNode} from 'react';
import {ProbesContext} from './ProbesProvider/useProbes';
import BlocksProvider, { BlocksContext, useBlocks } from './BlocksProvider';
import SimulatorStatusProvider from './SimulatorStatusProvider';

const mocks = {
	vault: {
		address: '0xdA816459F1AB5631232FE5e97a05BBBb94970c95',
		governance: '0xFEB4acf3df3cDEA7399794D0869ef76A6EfAff52',
		performanceFee: BigNumber.from(2000),
		managementFee: ethers.constants.Zero,
		version: '0.4.3',
		network: {chainId: 1}
	} as Vault,
	strategy: {
		a: { 
			address: '0x1676055fE954EE6fc388F9096210E5EbE0A9070c',
			totalDebt: BigNumber.from(ethers.utils.parseEther('100')),
			estimatedTotalAssets: BigNumber.from(ethers.utils.parseEther('102')),
			totalGain: BigNumber.from(ethers.utils.parseEther('2')),
			totalLoss: BigNumber.from(ethers.utils.parseEther('0')),
			lastReport: BigNumber.from((Math.round(Date.now() / 1000) - (7 * 24 * 60 * 60))),
			delegatedAssets: ethers.constants.Zero,
			network: {chainId: 1}
		} as Strategy,
	}
};

const probe = {
	name: 'mock' as 'mock',
	start: jest.fn(async (provider: providers.JsonRpcProvider) => {}),
	stop: jest.fn(async (results, provider: providers.JsonRpcProvider) => {}),
};

export default function MockProbesProvider({children}: {children: ReactNode}) {
	return <SimulatorStatusProvider>
		<ProbesContext.Provider value={{probes: [probe]}}>
			{children}
		</ProbesContext.Provider>
	</SimulatorStatusProvider>;
}

describe('<SimulatorProvider />', () => {

	let provider: ethers.providers.JsonRpcProvider;

	beforeAll(async () => {
    if(!process.env.TENDERLY_FORK_API) throw 'TENDERLY_FORK_API missing from .env';
    if(!process.env.TENDERLY_ACCESS_TOKEN) throw 'TENDERLY_ACCESS_TOKEN missing from .env';

    const result = await axios({
      method: 'post',
      headers: {'X-Access-Key': process.env.TENDERLY_ACCESS_TOKEN},
      url: process.env.TENDERLY_FORK_API,
      data: {network_id: 1}
    });

		const simulatorUrl = `${config.tenderly.rpcUrl}/${result.data.simulation_fork.id}`;
    provider = new ethers.providers.JsonRpcProvider(simulatorUrl);
	});

	let render: RenderHookResult<{
		blocks: BlocksContext, 
		simulator: Simulator
	}, unknown>;
	beforeEach(() => {
    render = renderHook(() => ({
			blocks: useBlocks(),
			simulator: useSimulator()
		}), {
			wrapper: ({children}) => 
				<BlocksProvider>
					<MockProbesProvider>
						<SimulatorProvider>
							{children}
						</SimulatorProvider>
					</MockProbesProvider>
				</BlocksProvider>
		});
	});

	test('Idles by default', async () => {
		const {simulator} = render.result.current;
		expect(simulator.simulating).toBeFalsy();
		expect(simulator.blockPointer).toBeNull();
		expect(simulator.results.length).toBe(0);
		expect(probe.start).toBeCalledTimes(0);
		expect(probe.stop).toBeCalledTimes(0);
	});

	test('Simulates nothing', async () => {
		await act(async () => {
			await render.result.current.simulator.simulate(provider);
		});

		const {simulator} = render.result.current;
		expect(simulator.simulating).toBeFalsy();
		expect(simulator.blockPointer).toBeNull();
		expect(simulator.results.length).toBe(0);
		expect(probe.start).toBeCalledTimes(1);
		expect(probe.stop).toBeCalledTimes(1);		
	});

	test('Simulates blocks and gives results', async () => {
		await act(async () => {
			await render.result.current.blocks.addHarvest(mocks.vault, mocks.strategy.a);
		});

		await act(async () => {
			await render.result.current.simulator.simulate(provider);
		});

		const {simulator} = render.result.current;
		expect(simulator.results.length).toBe(1)
		expect(simulator.results[0].status).toBe('ok');
		expect(simulator.results[0].output).toBeDefined();
		expect(simulator.results[0].explorerUrl).toBeDefined();
		expect(simulator.results[0].error).toBeUndefined();
		expect(probe.start).toBeCalledTimes(1);
		expect(probe.stop).toBeCalledTimes(1);
	}, 10_000);

	test('Simulates blocks failing', async () => {
		await act(async () => {
			await render.result.current.blocks.addDebtRatioUpdate(mocks.vault, mocks.strategy.a, 1_000_000_000);
		});

		await act(async () => {
			await render.result.current.simulator.simulate(provider);
		});

		const {simulator} = render.result.current;
		expect(simulator.results.length).toBe(2);
		expect(simulator.results[0].status).toBe('error');
		expect(simulator.results[0].output).toBeUndefined();
		expect(simulator.results[0].explorerUrl).toBeDefined();
		expect(simulator.results[0].error).toBeDefined();
		expect(probe.start).toBeCalledTimes(1);
		expect(probe.stop).toBeCalledTimes(1);
	}, 10_000);

	test('Resets the simulator', async () => {
		await act(async () => {
			await render.result.current.blocks.addHarvest(mocks.vault, mocks.strategy.a);
		});

		await act(async () => {
			await render.result.current.simulator.simulate(provider);
			await render.result.current.simulator.reset();
		});

		expect(render.result.current.simulator.results.length).toBe(0);
	});
});
