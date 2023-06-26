import React, {useMemo} from 'react';
import {useFilter} from './Filter/useFilter';
import {useNavigate} from 'react-router-dom';
import Tile from './Tile';
import {formatNumber} from '../../utils/utils';

export default function List() {
	const navigate = useNavigate();
	const {filter, ready} = useFilter();

	const totalTvl = useMemo(() => {
		return filter.map(vault => {
			if(!vault.tvls?.tvls?.length) return 0;
			const series = [vault.tvls.dates.slice(-3), vault.tvls.tvls.slice(-3)][1];
			return series[series.length - 1];
		}).reduce((a, b) => a + b, 0);
	}, [filter]);

	if(!ready) return <></>;

	return <div className={`
		max-w-full p-2 sm:p-4 
		grid grid-flow-row gap-2 grid-cols-1 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4`}>

		<div className={'sm:min-h-[280px] pb-4 sm:py-0 flex flex-col items-center justify-center text-2xl sm:text-3xl'}>
			<div className={'grid grid-cols-3 gap-2 sm:gap-4'}>
				<div className={'font-mono text-right'}>{filter.length}</div>
				<div className={'col-span-2'}>{'Vaults'}</div>
				<div className={'font-mono text-right'}>{formatNumber(totalTvl, 0, 'No TVL', true)}</div>
				<div className={'col-span-2'}>{'TVL (USD)'}</div>
			</div>
		</div>

		{filter.map((vault, index) => {
			return <Tile key={index} vault={vault} onClick={(event) => {
				if (event.ctrlKey || event.shiftKey || event.metaKey) {
					window.open(`/vault/${vault.address}`, '_blank');
				}else{
					navigate(`/vault/${vault.address}`);
				}
			}} />;
		})}
	</div>;
}