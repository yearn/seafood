import React, {useMemo} from 'react';
import {RiskReportWithVaults} from '.';
import {useChrome} from '../../Chrome';
import {useMediumBreakpoint} from '../../../utils/breakpoints';

export default function Header({group}: {group: RiskReportWithVaults}) {
	const {overpassClassName} = useChrome();
	const mediumBreakpoint = useMediumBreakpoint();

	const strategyCount = useMemo(() => {
		return group.vaults.map(v => v.strategies.length).reduce((a, b) => a + b, 0);
	}, [group]);

	if(mediumBreakpoint) return <div className={'-mt-[80px] pt-0'}>
		<div className={'flex flex-col px-16 pt-3 gap-2'}>
			<h1 className={`
				flex flex-col
				font-bold text-4xl`}>{group.riskGroup}</h1>
			<div className={'text-sm'}>
				{`risk group covering ${strategyCount} strategies`}
			</div>
		</div>
	</div>;

	return <div className={`
		sticky top-0 z-10 pb-4
		${overpassClassName}`}>
		<div className={'flex flex-col px-4 pt-3 gap-2'}>
			<h1 className={`
				flex flex-col
				font-bold text-4xl`}>{group.riskGroup}</h1>
			<div className={'text-sm'}>
				{`risk group covering ${strategyCount} strategies`}
			</div>
		</div>
	</div>;
}
