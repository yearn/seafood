import React from 'react';
import {formatTokens, formatPercent} from '../../utils/utils';
import {useVault} from './VaultProvider';

function Row({className, children}) {
	return <div className={`py-1 w-full grid items-center justify-between ${className}`}>
		{children}
	</div>;
}

function Cell({className, children}) {
	return <div className={`${className}`}>
		{children}
	</div>;
}

export default function Summary({className}) {
	const {vault, token} = useVault();

	return <div className={`
		self-start px-4 sm:pl-8 sm:pr-4 flex flex-col
		gap-4 sm:gap-8
		${className}`}>
		<div>
			<Row className={'grid-cols-2'}>
				<Cell className={'font-bold text-2xl'}>{'Total Assets'}</Cell>
				<Cell className={'font-bold font-mono text-3xl text-right'}>{formatTokens(vault.totalAssets, token.decimals, 2, true)}</Cell>
			</Row>
			<Row className={'grid-cols-2'}>
				<Cell>{'Free Assets'}</Cell>
				<Cell className={'font-mono text-right'}>{(formatTokens(vault.totalAssets - vault.totalDebt, token.decimals, 2, true))}</Cell>
			</Row>
			<Row className={'grid-cols-2'}>
				<Cell>{'Allocated'}</Cell>
				<Cell className={'font-mono text-right'}>{formatPercent(vault.debtRatio/10_000, 0, '--')}</Cell>
			</Row>
		</div>

		<div className={'mb-4'}>
			<Row className={'grid-cols-2'}>
				<Cell>{'Current APY'}</Cell>
				<Cell className={'text-primary-400 text-right'}>{'Simulated APY'}</Cell>
			</Row>
			<Row className={'grid-cols-4'}>
				<Cell>{'Gross'}</Cell>
				<Cell className={'font-mono text-right'}>{'0.00%'}</Cell>
				<Cell className={'font-mono text-primary-400 text-right'}>{'0.00%'}</Cell>
				<Cell className={'font-mono text-primary-400 text-right'}>{'+0bps'}</Cell>
			</Row>
			<Row className={'grid-cols-4 bg-selected-400/5'}>
				<Cell className={'font-bold text-xl'}>{'Net'}</Cell>
				<Cell className={'font-bold font-mono text-xl text-right'}>{'0.00%'}</Cell>
				<Cell className={'font-bold font-mono text-primary-400 text-xl text-right'}>{'0.00%'}</Cell>
				<Cell className={'font-bold font-mono text-primary-400 text-xl text-right'}>{'+0bps'}</Cell>
			</Row>
			<Row className={'grid-cols-4'}>
				<Cell>{'Weekly'}</Cell>
				<Cell className={'font-mono text-right'}>{'0.00%'}</Cell>
				<Cell className={'font-mono text-primary-400 text-right'}>{'0.00%'}</Cell>
				<Cell className={'font-mono text-primary-400 text-right'}>{'+0bps'}</Cell>
			</Row>
			<Row className={'grid-cols-4 bg-selected-400/5'}>
				<Cell>{'Monthly'}</Cell>
				<Cell className={'font-mono text-right'}>{'0.00%'}</Cell>
				<Cell className={'font-mono text-primary-400 text-right'}>{'0.00%'}</Cell>
				<Cell className={'font-mono text-primary-400 text-right'}>{'+0bps'}</Cell>
			</Row>
			<Row className={'grid-cols-4'}>
				<Cell>{'Inception'}</Cell>
				<Cell className={'font-mono text-right'}>{'0.00%'}</Cell>
				<Cell className={'font-mono text-primary-400 text-right'}>{'0.00%'}</Cell>
				<Cell className={'font-mono text-primary-400 text-right'}>{'+0bps'}</Cell>
			</Row>
			<Row className={'grid-cols-4 bg-selected-400/5'}>
				<Cell>{'PPS'}</Cell>
				<Cell className={'font-mono text-right'}>{'0.00%'}</Cell>
				<Cell className={'font-mono text-primary-400 text-right'}>{'0.00%'}</Cell>
				<Cell className={'font-mono text-primary-400 text-right'}>{'+0bps'}</Cell>
			</Row>
		</div>
	</div>;
}