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
	loss: string,
	debt_paid: string,
	debt_added: string,
	want_gain_usd: string,
	rough_apr_pre_fee: string
}

async function fetchHarvestReports(vault: Vault) {
	const strategies = vault.strategies.map(strategy => strategy.address);
	const response = await fetch('/api/getVaults/AllStrategyReports', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		},
		body: JSON.stringify({chainId: vault.network.chainId, strategies})
	});
	return await response.json() as HarvestReport[];
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
	fetchHarvestReports,
	fetchMeta,
	getTvlSeries
};
