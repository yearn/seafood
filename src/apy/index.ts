import {ethers} from 'ethers';
import {estimateBlockHeight} from '../utils/defillama';
import computeV2Averaged from './v2/averaged';
import * as types from './types';

export async function getSamples(provider: ethers.providers.BaseProvider, reportBlocks: number[]) {
	const day = 24 * 60 * 60;
	const latestBlockNumber = await provider.getBlockNumber();
	const latestBlock = await provider.getBlock(latestBlockNumber);
	const idealSamples = {
		[0]: latestBlockNumber,
		[-7]: await estimateBlockHeight(provider.network.chainId, latestBlock.timestamp - 7 * day),
		[-30]: await estimateBlockHeight(provider.network.chainId, latestBlock.timestamp - 30 * day),
		inception: reportBlocks[0]
	};
	return idealSamples;
}

export function getApyComputer(type: string) : types.ApyComputer {
	type; // shh.. we'll use this soon
	return {
		type: 'v2:averaged',
		compute: computeV2Averaged
	};
}
