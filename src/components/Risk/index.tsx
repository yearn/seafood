import React from 'react';
import useScrollOverpass from '../../context/useScrollOverpass';
import FilterProvider from './Filter/Provider';
import Filter from './Filter';
import Heatamp from './Heatmap';
import HeatmapColumns from './Heatmap/Columns';

export default function Risk() {
	const {overpassClassName} = useScrollOverpass();

	return <FilterProvider>
		<div className={'w-full pb-20'}>
			<div className={'flex flex-col gap-1'}>
				<div className={`sticky top-0 left-0 pr-4 pt-2 pb-2 grid grid-cols-10 gap-1 ${overpassClassName}`}>
					<div className={'pb-2 col-span-10'}>
						<Filter />
					</div>
					<HeatmapColumns />
				</div>
				<Heatamp />
			</div>
		</div>
	</FilterProvider>;
}
