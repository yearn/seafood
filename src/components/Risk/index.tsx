import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import ScrollContainer from 'react-indiana-drag-scroll';
import Filter from './Filter';
import Header from './Heatmap/Header';
import Heatamp from './Heatmap';
import Footer from './Heatmap/Footer';
import {useChrome} from '../Chrome';
import {useMediumBreakpoint} from '../../utils/breakpoints';
import {usePowertools} from '../Powertools';

export default function Risk() {
	const headerContainer = useRef<HTMLDivElement>(null);
	const heatmapContainer = useRef<HTMLElement>(null);
	const footerContainer = useRef<HTMLDivElement>(null);
	const {overpassClassName, showOverpassClassName} = useChrome();
	const mediumBreakpoint = useMediumBreakpoint();
	const {setLeftPanel, setBottomPanel, setShowSimulator} = usePowertools();

	const onScrollHeatmap = useCallback(() => {
		if(!headerContainer.current || !heatmapContainer.current || !footerContainer.current) return;
		headerContainer.current.scrollLeft = heatmapContainer.current.scrollLeft;
		footerContainer.current.scrollLeft = heatmapContainer.current.scrollLeft;
	}, [headerContainer, heatmapContainer, footerContainer]);

	const header = useMemo(() => <div ref={headerContainer} className={`
		w-full sm:px-24 2xl:px-32 flex items-center gap-1 overflow-x-hidden
		sm:flex-none sm:grid sm:grid-cols-10`}>
		<Header />
	</div>, []);

	useEffect(() => {
		if(!mediumBreakpoint) return;
		setLeftPanel(<Filter />);
		setBottomPanel(header);
		setShowSimulator(false);
		return () => {
			setBottomPanel(undefined);
			setShowSimulator(true);
		};
	}, [mediumBreakpoint, setLeftPanel, setBottomPanel, header, setShowSimulator]);

	if(mediumBreakpoint) return <div className={'relative w-full h-full pb-20'}>
		<div className={'flex flex-col gap-1'}>
			<ScrollContainer innerRef={heatmapContainer} 
				onStartScroll={onScrollHeatmap} 
				onScroll={onScrollHeatmap} 
				onEndScroll={onScrollHeatmap} 
				className={'w-full sm:px-24 2xl:px-32 flex flex-col gap-1'}>
				<Heatamp />
			</ScrollContainer>
		</div>
		<div className={`fixed bottom-0 left-6 right-0 sm:px-24 2xl:px-32 ${showOverpassClassName}`}>
			<Footer innerRef={footerContainer} />
		</div>
	</div>;

	return <div className={'w-full pb-20'}>
		<div className={'relative flex flex-col gap-1'}>
			<div className={`
				sticky top-0 left-0 sm:pr-4 pt-2 pb-2 flex flex-col items-center gap-2
				${overpassClassName}`}>
				<div className={'w-full sm:pb-2 col-span-10'}>
					<Filter />
				</div>
				{header}
			</div>
			<ScrollContainer innerRef={heatmapContainer} 
				onStartScroll={onScrollHeatmap} 
				onScroll={onScrollHeatmap} 
				onEndScroll={onScrollHeatmap} 
				className={'w-full sm:px-24 2xl:px-32 flex flex-col gap-1'}>
				<Heatamp />
			</ScrollContainer>
		</div>
		<div className={`fixed w-full bottom-0 sm:px-24 2xl:px-32 ${showOverpassClassName}`}>
			<Footer innerRef={footerContainer} />
		</div>
	</div>;
}
