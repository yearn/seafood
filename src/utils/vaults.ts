import {BigNumber, ethers} from 'ethers';
import {Vault} from '../context/useVaults/types';

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

function computeDegradationTime(vault: Vault) {
	if((vault?.lockedProfitDegradation || ethers.constants.Zero).eq(0)) return BigNumber.from(0);
	const coefficient = BigNumber.from('1000000000000000000');
	return coefficient.div(vault.lockedProfitDegradation as BigNumber);
}

export {
	fetchHarvestReports,
	computeDegradationTime
};
