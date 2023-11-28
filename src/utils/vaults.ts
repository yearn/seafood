import {BigNumber, ethers} from 'ethers';
import {Vault} from '../context/useVaults/types';
import config from '../config.json';

function computeDegradationTime(vault: Vault) {
	if((vault?.lockedProfitDegradation || ethers.constants.Zero).eq(0)) return ethers.constants.Zero;
	const coefficient = BigNumber.from('1000000000000000000');
	return coefficient.div(vault.lockedProfitDegradation as BigNumber);
}

export async function fetchMetas(vault: Vault) {
	if(!process.env.REACT_APP_KONG_API_URL) throw new Error('!process.env.REACT_APP_KONG_API_URL');

	const response = await fetch(process.env.REACT_APP_KONG_API_URL, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			query: `query Vault($chainId: Int!, $address: String!) {
				vault(chainId: $chainId, address: $address) {
					withdrawalQueue {
						address
						description
					}
					assetDescription
				}
			}
			`,
			variables: {chainId: vault.network.chainId, address: vault.address}
		})
	});

	const json = await response.json();
	return json.data.vault as {
		assetDescription: string,
		withdrawalQueue: {address: string, description: string}[]
	};
}

export interface HarvestReport {
	chain_id: string,
	block: string,
	timestamp: string,
	date_string: string,
	txn_hash: string,
	vault_address: string,
	strategy_address: string,
	gain: string,
	total_gain: string,
	loss: string,
	total_loss: string,
	debt_paid: string,
	debt_added: string,
	want_gain_usd: string,
	rough_apr_pre_fee: string
}

async function fetchHarvestReportsForStrategy(chainId: number, vault: string, strategy: string) {
	if(!process.env.REACT_APP_KONG_API_URL) throw new Error('!process.env.REACT_APP_KONG_API_URL');

	const harvests = [] as HarvestReport[];
	const response = await fetch(process.env.REACT_APP_KONG_API_URL, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			query: `query Harvest($chainId: Int, $address: String, $limit: Int) {
				harvests(chainId: $chainId, address: $address, limit: $limit) {
					chainId
					blockNumber
					blockTime
					transactionHash
					profit
					profitUsd
					totalProfit
					loss
					lossUsd
					totalLoss
					aprGross
					aprNet
				}
			}`,
			variables: {chainId, address: strategy, limit: 1000}
		})
	});

	const json = await response.json();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	harvests.push(...(json.data.harvests as any[]).map(harvest => ({
		chain_id: harvest.chainId,
		block: harvest.blockNumber,
		timestamp: harvest.blockTime,
		date_string: '',
		txn_hash: harvest.transactionHash,
		vault_address: vault,
		strategy_address: strategy,
		gain: harvest.profit,
		total_gain: harvest.totalProfit,
		loss: harvest.loss,
		total_loss: harvest.totalLoss,
		want_gain_usd: harvest.profitUsd,
		rough_apr_pre_fee: harvest.aprGross
	} as HarvestReport)));

	return harvests;
}

async function fetchHarvestReports(vault: Vault) {
	if(!process.env.REACT_APP_KONG_API_URL) throw new Error('!process.env.REACT_APP_KONG_API_URL');

	const harvests = [] as HarvestReport[];
	const strategies = vault.strategies.map(strategy => strategy.address);
	for(const strategy of strategies) {
		harvests.push(...await fetchHarvestReportsForStrategy(vault.network.chainId, vault.address, strategy));
	}

	return harvests;
}

async function fetchMeta(vault: Vault) {
	const request = `${config.ydaemon.url}/${vault.network.chainId}/meta/vaults/${vault.address}`;
	const response = await fetch(request);
	return await response.json();
}

function getTvlSeries(vault: Vault) {
	if(!vault.tvls?.tvls?.length) return [];
	return [vault.tvls.dates.slice(-3), vault.tvls.tvls.slice(-3)][1];
}

export {
	computeDegradationTime,
	fetchHarvestReportsForStrategy,
	fetchHarvestReports,
	fetchMeta,
	getTvlSeries
};
