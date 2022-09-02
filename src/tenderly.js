import {ethers} from 'ethers';
import config from './config';

async function createProvider(chainId) {
	const result = await fetch(config.tenderly.forkUrl, {
		method: 'POST',
		body: JSON.stringify({network_id: chainId}),
	});

	const data = await result.json();
	return new ethers.providers.JsonRpcProvider(
		`${config.tenderly.rpcUrl}/${data['simulation_fork']['id']}`
	);
}

async function latestSimulationUrl(tenderly) {
	const id = await tenderly.send('evm_getLatest', []);
	return `${config.tenderly.dashboardUrl}/${tenderly.connection.url.substring(29)}/simulation/${id}`;
}

async function simulate(blocks, tenderly) {
	const results = [];
	for(let block of blocks) {
		const blockResult = {block};
		const contractSimulator = block.contract.connect(tenderly.getSigner(block.signer));
		const functionName = `${block.functionCall.name}(${block.functionCall.inputs.map(input => input.type)})`;
		const functionCall = contractSimulator.functions[functionName];

		try {
			const result = await functionCall(...block.functionInput, {gasLimit: 8_000_000, gasPrice: 0});
			blockResult.output = result.wait ? await result.wait() : result;
			blockResult.status = 'ok';
		} catch(error) {
			console.warn(error);
			blockResult.status = 'error';
			blockResult.error = error;
		}

		blockResult.simulationUrl = await latestSimulationUrl(tenderly);
		results.push(blockResult);
	}

	return results;
}

export default {
	createProvider,
	latestSimulationUrl,
	simulate
};