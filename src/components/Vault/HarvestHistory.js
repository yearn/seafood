import React from 'react';
import {BiggerThanSmallScreen, SmallScreen} from '../../utils/breakpoints';
import {formatPercent, getTxExplorer} from '../../utils/utils';
import {A} from '../controls';
import dayjs from 'dayjs';
import EigenPhi from './EigenPhi';
import {Number} from '../controls/Fields';

function ColumnHeader({children}) {
	return <th className={'text-right first:text-left'}>{children}</th>;
}

function Cell({textAlign = 'text-right', children}) {
	return <td className={`pl-4 first:pl-0 font-mono whitespace-nowrap ${textAlign}`}>{children}</td>;
}

function HarvestHistory({history}){
	return <>
		<SmallScreen>
			<div className={'w-full overflow-x-auto'}>
				<table>
					<thead>
						<tr>
							<ColumnHeader>{'History'}</ColumnHeader>
							<ColumnHeader>{'Gain'}</ColumnHeader>
							<ColumnHeader>{'(USD)'}</ColumnHeader>
							<ColumnHeader>{'APR'}</ColumnHeader>
						</tr>
					</thead>
					<tbody>
						{history.map((e, i) => {
							return <tr key={e.txn_hash} className={`${i % 2 === 0 ? '' : 'bg-selected-400/5'}`}>
								<Cell textAlign={'text-left'}>
									<div className={'flex items-center gap-2'}>
										<A href={getTxExplorer(e.chain_id, e.txn_hash)} target={'_blank'} rel={'noreferrer'}>
											{dayjs(new Date(e.timestamp * 1000)).format('YYYY-MM-DD')}
										</A>
										<EigenPhi tx={e.txn_hash} />
									</div>
								</Cell>
								<Cell><Number value={parseFloat(e.gain)} decimals={4} compact={true} /></Cell>
								<Cell><Number value={parseFloat(e.want_gain_usd)} decimals={4} compact={true} /></Cell>
								<Cell>{formatPercent(parseFloat(e.rough_apr_pre_fee))}</Cell>
							</tr>;
						})}
					</tbody>
				</table>
				{!history.length && <>{'No history'}</> }
			</div>
		</SmallScreen>
		<BiggerThanSmallScreen>
			<table className={'mt-4'}>
				<thead>
					<tr>
						<ColumnHeader>{'Harvest history'}</ColumnHeader>
						<ColumnHeader>{'Gain'}</ColumnHeader>
						<ColumnHeader>{'Gain (USD)'}</ColumnHeader>
						<ColumnHeader>{'APR'}</ColumnHeader>
					</tr>
				</thead>
				<tbody>
					{history.map((e, i) => {
						const time = new Date(e.timestamp * 1000);
						return <tr key={e.txn_hash} className={i % 2 === 0 ? 'bg-selected-400/5' : ''}>
							<Cell textAlign={'text-left'}>
								<div className={'flex items-center gap-3'}>
									<A href={getTxExplorer(e.chain_id, e.txn_hash)} target={'_blank'} rel={'noreferrer'}>{time.toGMTString()}</A>
									<EigenPhi tx={e.txn_hash} />
								</div>
							</Cell>
							<Cell><Number value={parseFloat(e.gain)} decimals={4} compact={true} /></Cell>
							<Cell><Number value={parseFloat(e.want_gain_usd)} decimals={4} compact={true} /></Cell>
							<Cell>{formatPercent(parseFloat(e.rough_apr_pre_fee))}</Cell>
						</tr>;
					})}
				</tbody>
			</table>
		</BiggerThanSmallScreen>
	</>;
}

export default HarvestHistory;