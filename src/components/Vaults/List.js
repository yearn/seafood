import React, {useCallback, useMemo, useState} from 'react';
import {useFilter} from './Filter/useFilter';
import {useNavigate} from 'react-router-dom';
import useKeypress from 'react-use-keypress';
import VaultTile from './VaultTile';
import StrategyTile from './StrategyTile';
import {formatNumber} from '../../utils/utils';
import InfiniteScroll from 'react-infinite-scroll-component';

const FRAME_SIZE = 20;

export default function List() {
	const navigate = useNavigate();
	const {filter, ready} = useFilter();
	const frameCount = useMemo(() => Math.ceil(filter.length / FRAME_SIZE), [filter]);
	const [framePointer, setFramePointer] = useState(0);

	useKeypress(['Enter'], () => {
		setTimeout(() => {
			if(filter.length === 1){
				navigate(`/vault/${filter[0].address}`);
			}
		}, 0);
	});

	const hasMoreFrames = useMemo(() => framePointer < frameCount - 1, [framePointer, frameCount]);

	const fetchFrame = useCallback(() => {
		if(!hasMoreFrames) return;
		setFramePointer(framePointer + 1);
	}, [hasMoreFrames, framePointer, setFramePointer]);

	const totalTvl = useMemo(() => {
		return filter.map(vault => {
			if(!vault.tvls?.tvls?.length) return 0;
			const series = [vault.tvls.dates.slice(-3), vault.tvls.tvls.slice(-3)][1];
			return series[series.length - 1];
		}).reduce((a, b) => a + b, 0);
	}, [filter]);

	const summary = useMemo(() => {
		return <div key={'summary'} className={'sm:min-h-[280px] pb-4 sm:py-0 flex flex-col items-center justify-center text-2xl sm:text-3xl'}>
			<div className={'grid grid-cols-3 gap-2 sm:gap-4'}>
				<div className={'font-mono text-right'}>{filter.length}</div>
				<div className={'col-span-2'}>{'Vaults'}</div>
				<div className={'font-mono text-right'}>{formatNumber(totalTvl, 0, 'No TVL', true)}</div>
				<div className={'col-span-2'}>{'TVL (USD)'}</div>
			</div>
		</div>;
	}, [filter, totalTvl]);

	const items = useMemo(() => {
		const frame = filter.slice(0, (framePointer + 1) * FRAME_SIZE);
		const result = frame.map((vault, index) => {
			if(vault.type === 'vault') return <VaultTile key={index} vault={vault} onClick={(event) => {
				if (event.ctrlKey || event.shiftKey || event.metaKey) {
					window.open(`/vault/${vault.address}`, '_blank');
				}else{
					navigate(`/vault/${vault.address}`);
				}
			}} />;

			if(vault.type === 'strategy') return <StrategyTile key={index} vault={vault} onClick={(event) => {
				if (event.ctrlKey || event.shiftKey || event.metaKey) {
					window.open(`/vault/${vault.address}`, '_blank');
				}else{
					navigate(`/vault/${vault.address}`);
				}
			}} />;
		});
		result.unshift(summary);
		return result;
	}, [filter, framePointer, navigate, summary]);

	if(!ready) return <></>;

	return <InfiniteScroll
		className={`max-w-full p-2 sm:p-4 
		grid grid-flow-row gap-2 grid-cols-1 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4`}
		scrollableTarget={'scrollcontainer'}
		dataLength={items.length}
		next={fetchFrame}
		hasMore={hasMoreFrames}>
		{items}
	</InfiniteScroll>;
}