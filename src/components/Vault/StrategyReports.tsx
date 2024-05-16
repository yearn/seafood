import React, {useEffect, useState} from 'react';
import {useVault} from './VaultProvider';
import {HarvestReport} from '../../utils/vaults';
import HarvestHistory from './HarvestHistory';
import InfoChart from './InfoChart';

function useStrategyReports() {
	const {vault} = useVault();
	const [reports, setReports] = useState<HarvestReport[]>([]);

	useEffect(() => {
		if (!process.env.REACT_APP_KONG_API_URL) throw new Error('!process.env.REACT_APP_KONG_API_URL');
		fetch(process.env.REACT_APP_KONG_API_URL, {
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
				variables: {
					chainId: vault.network.chainId, 
					address: vault.address
				}
			})
		}).then(res => {
			res.json().then(data => {
				const result = [];
				/* eslint-disable @typescript-eslint/no-explicit-any */
				result.push(...(data.data.strategyReports as any[]).map(harvest => ({
					chain_id: harvest.chainId,
					block: harvest.blockNumber,
					timestamp: harvest.blockTime,
					date_string: '',
					txn_hash: harvest.transactionHash,
					vault_address: vault.address,
					strategy_address: vault.address,
					gain: harvest.profit,
					loss: harvest.loss,
					want_gain_usd: harvest.profitUsd,
					rough_apr_pre_fee: harvest.apr.gross
				} as HarvestReport)));
				setReports(result);
			});
		});
	}, [vault, setReports]);

	return reports;
}

export default function StrategyReports() {
	const reports = useStrategyReports();
	return <div className={'mb-20 px-2 sm:mb-8 sm:px-0 w-full flex flex-col gap-2'}>
		<div className={'w-full h-64'}>
			<InfoChart
				name={'Report APR'}
				x={reports.map(d => d.date_string).reverse()}
				y={reports.map(d => {
					let amount = parseFloat(d.rough_apr_pre_fee) * 100;
					if (amount > 200){ amount = 200; }
					return amount;
				}).reverse()} />
		</div>
		<HarvestHistory history={reports} />
	</div>;
}
