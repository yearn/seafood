import {Vault} from '../context/useVaults/types';

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
	return await response.json();
}

export {
	fetchHarvestReports
};
