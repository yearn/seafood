import React from 'react';
import {FormatNumer, FormatPercent, FormatCurrency, GetExplorerTx} from '../../utils/utils';
import css from './HarvestHistory.module.css';

function HarvestHistory({history}){
	return <div className={css.main}>
		<div className={css.header}>
			<h3>{'Harvest history'}</h3>
			<div>{'Gain'}</div>
			<div>{'Gain (USD)'}</div>
			<div>{'APR'}</div>
			<div></div>
			<div></div>
		</div>
		{history.map(e => {
			const time = new Date(e.timestamp * 1000);
			return <div key={e.txn_hash} className={css.row}>
				<div><a href={GetExplorerTx(e.chain_id, e.txn_hash)} target={'_blank'} rel={'noreferrer'}>{time.toGMTString()}</a></div>
				<div>{FormatNumer(parseFloat(e.total_gain), 5)}</div>
				<div>{FormatCurrency(parseFloat(e.want_gain_usd))}</div>
				<div>{FormatPercent(parseFloat(e.rough_apr_pre_fee))}</div>
				<div></div>
				<div></div>
			</div>;
		})}
	</div>;
}

export default HarvestHistory;