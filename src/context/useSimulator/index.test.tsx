import {act, RenderHookResult} from '@testing-library/react';
import {renderHook} from '@testing-library/react'
import axios from 'axios';
import {BigNumber, ethers, providers} from 'ethers';
import {Strategy, Vault} from '../useVaults/types';
import SimulatorProvider, {Simulator, useSimulator} from '.';
import config from '../../config.json';
import {Block, makeDebtRatioUpdateBlock, makeHarvestBlock} from './Blocks';
import {ReactNode} from 'react';
import {ProbesContext} from './ProbesProvider/useProbes';

const mocks = {
	vault: {
		address: '0xdA816459F1AB5631232FE5e97a05BBBb94970c95',
		governance: '0xFEB4acf3df3cDEA7399794D0869ef76A6EfAff52',
		performanceFee: BigNumber.from(2000),
		managementFee: BigNumber.from(0),
		version: '0.4.3'
	} as Vault,
	strategy: {
		a: { 
			address: '0x1676055fE954EE6fc388F9096210E5EbE0A9070c',
			totalDebt: BigNumber.from(ethers.utils.parseEther('100')),
			estimatedTotalAssets: BigNumber.from(ethers.utils.parseEther('102')),
			totalGain: BigNumber.from(ethers.utils.parseEther('2')),
			totalLoss: BigNumber.from(ethers.utils.parseEther('0')),
			lastReport: BigNumber.from((Math.round(Date.now() / 1000) - (7 * 24 * 60 * 60))),
			delegatedAssets: BigNumber.from(0)
		} as Strategy,
	}
};

const mockProbe = {
	start: jest.fn(async (blocks: Block[], provider: providers.JsonRpcProvider) => ({})),
	stop: jest.fn(async (blocks: Block[], provider: providers.JsonRpcProvider) => ({}))
}

export default function MockProbesProvider({children}: {children: ReactNode}) {
	return <ProbesContext.Provider value={{probes: [mockProbe]}}>
		{children}
	</ProbesContext.Provider>;
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



	let renderSimulator: RenderHookResult<Simulator, unknown>;
	beforeEach(() => {
    renderSimulator = renderHook(() => useSimulator(), {
			wrapper: ({children}) => <MockProbesProvider>
					<SimulatorProvider>{children}</SimulatorProvider>
				</MockProbesProvider>
		});
	});

	function simulator() {
		return renderSimulator.result.current;
	}

	it('Idles by default', async () => {
		expect(simulator().simulating).toBeFalsy();
		expect(simulator().blockPointer).toBeNull();
		expect(simulator().results.length).toBe(0);
		expect(mockProbe.start).toBeCalledTimes(0);
		expect(mockProbe.stop).toBeCalledTimes(0);
	});

	it('Simulates nothing', async () => {
		await act(async () => {
			await simulator().simulate([], provider);
		});

		expect(simulator().simulating).toBeFalsy();
		expect(simulator().blockPointer).toBeNull();
		expect(simulator().results.length).toBe(0);
		expect(mockProbe.start).toBeCalledTimes(1);
		expect(mockProbe.stop).toBeCalledTimes(1);		
	});

	it('Simulates blocks and gives results', async () => {
		const harvest = await makeHarvestBlock(mocks.vault, mocks.strategy.a, provider);

		await act(async () => {
			await simulator().simulate([harvest], provider);
		});

		expect(simulator().results.length).toBe(1);
		expect(simulator().results[0].status).toBe('ok');
		expect(simulator().results[0].output).toBeDefined();
		expect(simulator().results[0].explorerUrl).toBeDefined();
		expect(simulator().results[0].error).toBeUndefined();
		expect(mockProbe.start).toBeCalledTimes(1);
		expect(mockProbe.stop).toBeCalledTimes(1);
	});

	it('Simulates blocks failing', async () => {
		const drupdate = await makeDebtRatioUpdateBlock(mocks.vault, mocks.strategy.a, 1_000_000_000, provider);

		await act(async () => {
			await simulator().simulate([drupdate], provider);
		});

		expect(simulator().results.length).toBe(1);
		expect(simulator().results[0].status).toBe('error');
		expect(simulator().results[0].output).toBeUndefined();
		expect(simulator().results[0].explorerUrl).toBeDefined();
		expect(simulator().results[0].error).toBeDefined();
		expect(mockProbe.start).toBeCalledTimes(1);
		expect(mockProbe.stop).toBeCalledTimes(1);
	});
});
