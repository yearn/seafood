import {BigNumber} from 'ethers';
import React, {useCallback, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {Strategy, Vault} from '../../../context/useVaults/types';
import {formatNumber} from '../../../utils/utils';
import Chip from '../../tiles/Chip';

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
		bg-selected-100 dark:bg-primary-600/20
		hover:bg-selected-300 hover:dark:bg-selected-600
		active:transform active:scale-[99%]
		transition duration-200
		rounded-lg cursor-pointer`}>
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
			<Chip label={vault.version} className={'bg-primary-400 dark:bg-primary-900'} />
			<Chip label={vault.network.name} className={`bg-${vault.network.name}`} />
		</div>
	</div>;
}
