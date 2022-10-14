import {getChain} from './utils';

async function estimateBlockHeight(chainId, blocktime) {
	const chain = getChain(chainId);
	const response = await fetch(`https://coins.llama.fi/block/${chain.name}/${blocktime}`, {
		headers: {accept: 'application/json'}
	});
	const {height} = await response.json();
	return height;
}

export {
	estimateBlockHeight
};
