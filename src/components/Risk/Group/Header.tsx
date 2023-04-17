import React, {useMemo} from 'react';
import {RiskReportWithVaults} from '.';
import {useChrome} from '../../Chrome';

export default function Header({group}: {group: RiskReportWithVaults}) {
	const {overpassClassName} = useChrome();

	const strategyCount = useMemo(() => {
		return group.vaults.map(v => v.strategies.length).reduce((a, b) => a + b, 0);
	}, [group]);

	return <div className={`
		sticky top-0 z-10 pb-4 sm:py-2
		sm:grid sm:grid-cols-2 sm:items-center
		${overpassClassName}`}>
		<div className={'flex flex-col px-4 pt-3 sm:pt-0 gap-2'}>
			<h1 className={`
				sm:w-fit flex flex-col sm:flex-row sm:items-center sm:gap-8
				indent-12 sm:indent-0 font-bold text-4xl sm:text-5xl`}>{group.riskGroup}</h1>
			<div className={'text-sm sm:indent-1'}>
				{`risk group with ${strategyCount} strategies`}
			</div>
		</div>
	</div>;
}
