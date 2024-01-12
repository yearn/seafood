import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {usePowertools} from '../Powertools';
import {Number} from '../controls/Fields';
import {useExposureByVyperVersion} from '.';
import Tile from '../Vaults/VaultTile';
import InfiniteScroll from 'react-infinite-scroll-component';

const FRAME_SIZE = 20;

function Header({version, vaults, tvl}: {version: string, vaults: number, tvl: number}) {
	return <div className={'w-3/4 flex items-end justify-between'}>
		<div className={'text-4xl'}>{`Vyper ${version} Exposure`}</div>
		<div className={'flex items-center gap-4 text-xl'}>
			<div className={'text-xl'}>{'Vaults: '}</div>
			<Number value={vaults} decimals={0} />
		</div>
		<div className={'flex items-center gap-4 text-xl'}>
			<div>{'TVL (USD): '}</div>
			<Number value={tvl} decimals={2} nonFinite={'No TVL'} compact={true} />
		</div>
	</div>;
}

export default function VyperVersionExposure() {
	const params = useParams();
	const navigate = useNavigate();
	const {setLeftPanelKey, setLeftPanel, setShowSimulator} = usePowertools();
	const exposureByVyperVersion = useExposureByVyperVersion();

	const exposure = useMemo(() => {
		if(params.version) {
			return exposureByVyperVersion.find(e => e.vyperVersion === params.version);
		}
	}, [params, exposureByVyperVersion]);

	useEffect(() => {
		if(exposure) {
			setLeftPanelKey(params.version as string);
			setLeftPanel(<Header version={exposure.vyperVersion} vaults={exposure.vaults.length} tvl={exposure.tvl} />);
		}
		setShowSimulator(false);
		return () => setShowSimulator(true);
	}, [params, setLeftPanelKey, setLeftPanel, setShowSimulator, exposure]);

	const frameCount = useMemo(() => Math.ceil((exposure?.vaults.length || 0) / FRAME_SIZE), [exposure]);
	const [framePointer, setFramePointer] = useState(0);
	const hasMoreFrames = useMemo(() => framePointer < frameCount - 1, [framePointer, frameCount]);

	const fetchFrame = useCallback(() => {
		if(!hasMoreFrames) return;
		setFramePointer(framePointer + 1);
	}, [hasMoreFrames, framePointer, setFramePointer]);

	const items = useMemo(() => {
		if(!exposure) return [];
		const frame = exposure.vaults.slice(0, (framePointer + 1) * FRAME_SIZE);
		const result = frame.map((vault, index) => {
			return <Tile key={index} vault={vault} onClick={(event?: React.MouseEvent<HTMLDivElement>) => {
				if(vault.version === 'program') return;
				if(event && (event.ctrlKey || event.shiftKey || event.metaKey)) {
					window.open(`/vault/${vault.address}`, '_blank');
				} else {
					navigate(`/vault/${vault.address}`);
				}
			}} />;
		});
		return result;
	}, [exposure, framePointer, navigate]);

	if(!exposure) return <></>;

	return <InfiniteScroll
		className={`max-w-full p-2 sm:p-4 
		grid grid-flow-row gap-2 grid-cols-1 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4`}
		scrollableTarget={'scrollcontainer'}
		dataLength={items.length}
		next={fetchFrame}
		hasMore={hasMoreFrames}
		loader={<></>}>
		{items}
	</InfiniteScroll>;
}