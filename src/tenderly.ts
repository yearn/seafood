import {ethers} from 'ethers';
import {Block, BlockOutput} from './context/useSimulator/Blocks';
import config from './config.json';

export interface SimulationResult {
	block: Block,
	status: 'ok' | 'error',
	output?: BlockOutput,
	explorerUrl?: string,
	error?: unknown
}

async function createProvider(network_id: number, block_number: number) {
	const result = await fetch('/api/tenderly/fork', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		},
		body: JSON.stringify({network_id, block_number})
	});

	const data = await result.json();
	return new ethers.providers.JsonRpcProvider(
		`${config.tenderly.rpcUrl}/${data.id}`
	);
}

async function latestSimulationUrl(tenderly: ethers.providers.JsonRpcProvider) {
	const id = await tenderly.send('evm_getLatest', []);
	return `${config.tenderly.dashboardUrl}/${tenderly.connection.url.substring(29)}/simulation/${id}`;
}

async function simulate(block: Block, tenderly: ethers.providers.JsonRpcProvider) {
	const result = {block} as SimulationResult;
	const contractSimulator = block.contract.connect(tenderly.getSigner(block.signer));
	const functionName = `${block.functionCall.name}(${block.functionCall.inputs.map(input => input.type)})`;
	const functionCall = contractSimulator.functions[functionName];

	try {
		const output = await functionCall(...block.functionInput, {gasLimit: 8_000_000, gasPrice: 0});
		result.output = output.wait ? await output.wait() : output;
		result.status = 'ok';
	} catch(error) {
		result.status = 'error';
		result.error = error;
	}

	result.explorerUrl = await latestSimulationUrl(tenderly);
	return result;
}

async function simulateAll(blocks: Block[], tenderly: ethers.providers.JsonRpcProvider) {
	const results = [];
	for(const block of blocks) {
		results.push(await simulate(block, tenderly));
	}
	return results;
}

export default {
	createProvider,
	latestSimulationUrl,
	simulate,
	simulateAll
};
