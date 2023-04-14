import React, {RefObject} from 'react';
import {formatNumber} from '../../../utils/utils';
import Cell from './Cell';
import ColumnHeader from './ColumnHeader';
import {useFilter} from '../Filter/Provider';

export default function Footer({innerRef} : {innerRef: RefObject<HTMLDivElement>}) {
	const {risk, totalTvlUsd, totalStrategies, totalMedianRisks} = useFilter();

	return <div ref={innerRef} className={`
		w-full pr-4 sm:pr-10 py-2 flex items-center gap-1 overflow-x-hidden
		sm:flex-none sm:grid sm:grid-cols-10`}>
		<ColumnHeader className={'flex-col'}>
			<div>{`${risk.length} groups`}</div>
			<div className={'text-xs'}>{`${totalStrategies} strategies`}</div>
		</ColumnHeader>
		<ColumnHeader className={'font-mono font-bold text-xl'}>
			{formatNumber(totalTvlUsd, 2, '', true)}
		</ColumnHeader>
		<Cell group={'Total Median'} category={'auditScore'} score={totalMedianRisks.auditScore} />
		<Cell group={'Total Median'} category={'codeReviewScore'} score={totalMedianRisks.codeReviewScore} />
		<Cell group={'Total Median'} category={'complexityScore'} score={totalMedianRisks.complexityScore} />
		<Cell group={'Total Median'} category={'longevityImpact'} score={totalMedianRisks.longevityImpact} />
		<Cell group={'Total Median'} category={'protocolSafetyScore'} score={totalMedianRisks.protocolSafetyScore} />
		<Cell group={'Total Median'} category={'teamKnowledgeScore'} score={totalMedianRisks.teamKnowledgeScore} />
		<Cell group={'Total Median'} category={'testingScore'} score={totalMedianRisks.testingScore} />
		<ColumnHeader>{'Median'}</ColumnHeader>
	</div>;
}
