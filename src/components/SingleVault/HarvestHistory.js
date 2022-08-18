import React from 'react';
import {formatNumber, formatPercent, formatCurrency, getTxExplorer} from '../../utils/utils';
import {A} from '../controls';

function ColumnHeader({children}) {
	return <div className={'text-right'}>{children}</div>;
}

function Cell({textAlign = 'text-right', children}) {
	return <div className={`whitespace-nowrap ${textAlign}`}>{children}</div>;
}

function HarvestHistory({history}){
	return <div className={'mt-4'}>
		<div className={'grid grid-cols-6 font-bold items-end'}>
			<h3>{'Harvest history'}</h3>
			<ColumnHeader>{'Gain'}</ColumnHeader>
			<ColumnHeader>{'Gain (USD)'}</ColumnHeader>
			<ColumnHeader>{'APR'}</ColumnHeader>
			<div></div>
			<div></div>
		</div>
		{history.map((e, i) => {
			const time = new Date(e.timestamp * 1000);
			return <div key={e.txn_hash} className={`grid grid-cols-6 ${i % 2 === 0 ? 'bg-selected-400/5' : ''}`}>
				<Cell textAlign={'text-left'}><A href={getTxExplorer(e.chain_id, e.txn_hash)} target={'_blank'} rel={'noreferrer'}>{time.toGMTString()}</A></Cell>
				<Cell>{formatNumber(parseFloat(e.total_gain), 5)}</Cell>
				<Cell>{formatCurrency(parseFloat(e.want_gain_usd))}</Cell>
				<Cell>{formatPercent(parseFloat(e.rough_apr_pre_fee))}</Cell>
				<div></div>
				<div></div>
			</div>;
		})}
	</div>;
}

export default HarvestHistory;