import {getChain} from './utils';

// 🦙 
//
// Use the llama to get the closest, higher block number to a timestamp.
//
// At the time of this writing..
//
// Here's the source for defillama's estimator:
// https://github.com/DefiLlama/defillama-server/blob/9e29f06f2773eff09ec1acce373f6c07bc392be3/coins/src/getBlock.ts#L69
//
// It's equivalent to the estimator used during yearn's apy computation:
// https://github.com/yearn/yearn-exporter/blob/2bd901223cc37da29a38e523994d87e930901390/yearn/utils.py#L61
//
async function estimateBlockHeight(chainId, timestamp) {
	const chain = getChain(chainId);
	const response = await fetch(`https://coins.llama.fi/block/${chain.name}/${timestamp}`, {
		headers: {accept: 'application/json'}
	});
	const {height} = await response.json();
	return height;
}

export {
	estimateBlockHeight
};
