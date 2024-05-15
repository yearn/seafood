import {BigNumber, ethers} from 'ethers';
import {Vault} from '../context/useVaults/types';
import config from '../config.json';

function computeDegradationTime(vault: Vault) {
	if((vault?.lockedProfitDegradation || ethers.constants.Zero).eq(0)) return ethers.constants.Zero;
	const coefficient = BigNumber.from('1000000000000000000');
	return coefficient.div(vault.lockedProfitDegradation as BigNumber);
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
			query: `query Reports($chainId: Int, $address: String) {
				strategyReports(chainId: $chainId, address: $address) {
					chainId
					blockNumber
					blockTime
					transactionHash
					profit
					profitUsd
					loss
					lossUsd
					apr {
						gross
						net
					}
				}
			}`,
			variables: {chainId, address: strategy}
		})
	});

	const json = await response.json();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	harvests.push(...(json.data.strategyReports as any[]).map(harvest => ({
		chain_id: harvest.chainId,
		block: harvest.blockNumber,
		timestamp: harvest.blockTime,
		date_string: '',
		txn_hash: harvest.transactionHash,
		vault_address: vault,
		strategy_address: strategy,
		gain: harvest.profit,
		loss: harvest.loss,
		want_gain_usd: harvest.profitUsd,
		rough_apr_pre_fee: harvest.apr.gross
	} as HarvestReport)));

	return harvests;
}

async function fetchHarvestReportsForVault(chainId: number, vault: string, strategy: string) {
	if(!process.env.REACT_APP_KONG_API_URL) throw new Error('!process.env.REACT_APP_KONG_API_URL');

	const harvests = [] as HarvestReport[];
	const response = await fetch(process.env.REACT_APP_KONG_API_URL, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			query: `query Reports($chainId: Int, $address: String) {
				vaultReports(chainId: $chainId, address: $address) {
					chainId
					blockNumber
					blockTime
					transactionHash
					profit: gain
					profitUsd: gainUsd
					loss
					lossUsd
					apr {
						gross
						net
					}
				}
			}`,
			variables: {chainId, address: vault}
		})
	});

	const json = await response.json();

	const oneYearAgo = new Date();
	oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
	const oneYearAgoSeconds = Math.floor(oneYearAgo.getTime() / 1000);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	harvests.push(...(json.data.vaultReports as any[]).map(harvest => ({
		chain_id: harvest.chainId,
		block: harvest.blockNumber,
		timestamp: harvest.blockTime,
		date_string: '',
		txn_hash: harvest.transactionHash,
		vault_address: vault,
		strategy_address: strategy,
		gain: harvest.profit,
		loss: harvest.loss,
		want_gain_usd: harvest.profitUsd,
		rough_apr_pre_fee: harvest.apr.gross
	} as HarvestReport)));

	return harvests.filter(h => Number(h.timestamp) > oneYearAgoSeconds);
}

async function fetchHarvestReports(vault: Vault) {
	if(!process.env.REACT_APP_KONG_API_URL) throw new Error('!process.env.REACT_APP_KONG_API_URL');

	const harvests = [] as HarvestReport[];
	for(const strategy of vault.withdrawalQueue) {
		harvests.push(...await fetchHarvestReportsForVault(vault.network.chainId, vault.address, strategy.address));
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
