import React from 'react';
import {formatNumber, formatPercent, highlightString} from '../../../utils/utils';
import Cell from './Cell';
import {useFilter} from '../Filter/Provider';
import Spinner from '../../controls/Spinner';

export default function Heatamp() {
	const {available, risk, totalTvlUsd, queryRe} = useFilter();

	if(!available) return <div className={`
		absolute w-full h-screen flex items-center justify-center`}>
		<Spinner />
	</div>;

	return <>
		{risk.map(report => <div key={report.riskGroup} className={`
			pr-4 flex items-center gap-1
			sm:flex-none sm:grid sm:grid-cols-10`}>
			<div className={'min-w-[138px] whitespace-nowrap flex flex-col items-center justify-center text-center'}>
				<div className={'text-xs 2xl:text-sm'}>{highlightString(report.riskGroup, queryRe)}</div>
				<div className={'text-xs'}>{`${report.strategies} strategies`}</div>
			</div>
			<Cell group={report.riskGroup} category={'TVLImpact'} score={report.riskDetails.TVLImpact} className={'flex flex-col'}>
				<div className={'font-mono font-bold text-xl'}>{formatNumber(report.tvlUsd, 2, '', true)}</div>
				<div className={'font-mono text-xs'}>{formatPercent(report.tvlUsd / totalTvlUsd)}</div>
			</Cell>
			<Cell group={report.riskGroup} category={'auditScore'} score={report.riskDetails.auditScore} />
			<Cell group={report.riskGroup} category={'codeReviewScore'} score={report.riskDetails.codeReviewScore} />
			<Cell group={report.riskGroup} category={'complexityScore'} score={report.riskDetails.complexityScore} />
			<Cell group={report.riskGroup} category={'longevityImpact'} score={report.riskDetails.longevityImpact} />
			<Cell group={report.riskGroup} category={'protocolSafetyScore'} score={report.riskDetails.protocolSafetyScore} />
			<Cell group={report.riskGroup} category={'teamKnowledgeScore'} score={report.riskDetails.teamKnowledgeScore} />
			<Cell group={report.riskGroup} category={'testingScore'} score={report.riskDetails.testingScore} />
			<Cell group={report.riskGroup} category={'median'} score={report.median} />
		</div>)}
	</>;
}
