import React from 'react';
import {formatNumber, formatPercent, highlightString} from '../../../utils/utils';
import useScrollOverpass from '../../../context/useScrollOverpass';
import Cell from './Cell';
import Header from './Header';
import {useFilter} from '../Filter/Provider';
import Spinner from '../../controls/Spinner';

export default function Heatamp() {
	const {available, risk, totalTvlUsd, totalStrategies, totalMedianRisks, queryRe} = useFilter();
	const {showClassName} = useScrollOverpass();

	if(!available) return <div className={`
		absolute w-full h-screen flex items-center justify-center`}>
		<Spinner />
	</div>;

	return <>
		{risk.map(report => <div key={report.riskGroup} className={'pr-4 grid grid-cols-10 gap-1'}>
			<div className={'flex flex-col items-center justify-center text-center'}>
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
		<div className={`fixed bottom-0 left-0 w-full pr-4 py-2 grid grid-cols-10 gap-1
			${showClassName}`}>
			<Header className={'flex-col'}>
				<div>{`${risk.length} groups`}</div>
				<div className={'text-xs'}>{`${totalStrategies} strategies`}</div>
			</Header>
			<Header className={'font-mono font-bold text-xl'}>
				{formatNumber(totalTvlUsd, 2, '', true)}
			</Header>
			<Cell group={'Total'} category={'auditScore'} score={totalMedianRisks.auditScore} />
			<Cell group={'Total'} category={'codeReviewScore'} score={totalMedianRisks.codeReviewScore} />
			<Cell group={'Total'} category={'complexityScore'} score={totalMedianRisks.complexityScore} />
			<Cell group={'Total'} category={'longevityImpact'} score={totalMedianRisks.longevityImpact} />
			<Cell group={'Total'} category={'protocolSafetyScore'} score={totalMedianRisks.protocolSafetyScore} />
			<Cell group={'Total'} category={'teamKnowledgeScore'} score={totalMedianRisks.teamKnowledgeScore} />
			<Cell group={'Total'} category={'testingScore'} score={totalMedianRisks.testingScore} />
			<Header>{'Median'}</Header>
		</div>
	</>;
}
