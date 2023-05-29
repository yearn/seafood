import {BigNumber} from 'ethers';
import React, {ReactNode, useCallback, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {Strategy, Vault} from '../../../context/useVaults/types';
import {formatNumber} from '../../../utils/utils';

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
		p-3 sm:px-6 sm:py-3 flex flex-col
		border border-transparent
		hover:border-selected-500 active:border-selected-700
		hover:text-selected-500 active:text-selected-700
		hover:dark:border-selected-600 active:dark:border-selected-700
		hover:dark:text-selected-600 active:dark:text-selected-700

		cursor-pointer`}>
		<div className={'flex items-center justify-between'}>
			<div className={'w-2/3 break-words truncate font-bold text-lg'}>{vault.name}</div>
			<div className={'font-mono text-2xl'}>{formatNumber(tvl, 2, '', true)}</div>
		</div>
		<div>
			{strategies.map((strategy, index) => <div key={index} className={`
				flex items-center justify-between`}>
				<div className={'w-2/3 break-words truncate'}>{strategy.name}</div>
				<div className={'font-mono'}>
					<div className={'font-mono text-xl'}>
						{`${formatNumber(calculateDebtUsd(strategy), 2, '', true)}`}
					</div>
				</div>
			</div>)}
		</div>
		<div className={'py-2 flex items-center gap-2'}>
			<Chip className={`
				bg-neutral-200/40 dark:bg-neutral-800/40
				border border-neutral-200 dark:border-neutral-800
				`}>{vault.version}</Chip>
			<Chip className={`
				bg-${vault.network.name}-40
				border border-${vault.network.name}
				`}>{vault.network.name}</Chip>
		</div>
	</div>;
}
