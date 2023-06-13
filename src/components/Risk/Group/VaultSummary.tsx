import {BigNumber} from 'ethers';
import React, {ReactNode, useCallback, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {Strategy, Vault} from '../../../context/useVaults/types';
import {Row} from '../../controls';
import {Number} from '../../controls/Fields';

function Chip({className, children}: {className: string, children: ReactNode}) {
	return <div className={`text-sm px-2 py-1 ${className}`}>
		{children}
	</div>;
}

export default function VaultSummary({vault, strategies}: {vault: Vault, strategies: Strategy[]}) {
	const navigate = useNavigate();

	const tvl = useMemo(() => {
		return vault.tvls?.tvls.slice(-1)[0] || 0;
	}, [vault]);

	const calculateDebtUsd = useCallback((strategy: Strategy) => {
		return vault.price * strategy.totalDebt.div(BigNumber.from('10').pow(vault.decimals)).toNumber();
	}, [vault]);

	return <div onClick={() => navigate(`/vault/${vault.address}`)} className={`
		p-1 sm:p-3 sm:px-6 sm:py-3 flex flex-col
		border border-transparent
		hover:border-selected-500 active:border-selected-700
		hover:text-selected-500 active:text-selected-700
		hover:dark:border-selected-600 active:dark:border-selected-700
		hover:dark:text-selected-600 active:dark:text-selected-700
		cursor-pointer`}>
		<Row label={<div className={'grow truncate font-bold text-lg'}>{vault.name}</div>}>
			<div className={`
				flex items-center gap-2
				text-xs`}>
				<Chip className={`
					bg-neutral-200/40 dark:bg-neutral-800/40
					border border-neutral-200 dark:border-neutral-800
					`}>{vault.version}</Chip>
				<Chip className={`
					bg-${vault.network.name}-40
					border border-${vault.network.name}
					`}>{vault.network.name}</Chip>
			</div>
		</Row>
		<Row label={'TVL (USD)'} alt={true} heading={true} className={'font-bold'}>
			<Number
				value={tvl}
				decimals={2}
				nonFinite={'No TVL'}
				compact={true} />
		</Row>

		{strategies.map((strategy, index) => 
			<Row key={index}
				alt={index % 2 === 1}
				label={<div className={'w-2/3 break-words truncate'}>{strategy.name}</div>}>
				<Number
					value={calculateDebtUsd(strategy)}
					decimals={2}
					nonFinite={'0'}
					compact={true} />
			</Row>)}
	</div>;
}
