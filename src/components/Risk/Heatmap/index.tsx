import React from 'react';
import {useNavigate} from 'react-router-dom';
import {formatNumber, formatPercent, highlightString} from '../../../utils/utils';
import Cell from './Cell';
import {useFilter} from '../Filter/Provider';
import Spinner from '../../controls/Spinner';
import {useVaults} from '../../../context/useVaults';

export default function Heatamp() {
	const navigate = useNavigate();
	const {ytvl} = useVaults();
	const {available, risk, queryRe} = useFilter();

	if(!available) return <div className={`
		absolute inset-0 flex items-center justify-center`}>
		<Spinner size={16} bloom={20} />
	</div>;

	return <>
		{risk.map(report => <div key={report.riskGroupId} className={`
			pr-4 sm:pr-0 flex items-center gap-1
			sm:flex-none sm:grid sm:grid-cols-10`}>
			<div onClick={() => navigate(`/risk/${report.riskGroupId}`)} className={`
			min-w-[138px] sm:min-w-0 h-16 py-1 px-1
			flex flex-col items-center justify-center text-center
			bg-neutral-200/40 dark:bg-neutral-800/40
			hover:bg-selected-300 active:bg-selected-400
			dark:hover:bg-selected-600 dark:active:bg-selected-700
			cursor-pointer`}
			title={report.riskGroup}>
				<div className={'w-[-webkit-fill-available] truncate text-xs 2xl:text-sm'}>{highlightString(report.riskGroup, queryRe)}</div>
				<div className={'text-xs'}>{`${report.strategies} strategies`}</div>
			</div>
			<Cell group={report.riskGroup} category={'TVLImpact'} score={report.riskDetails.TVLImpact} className={'flex flex-col'}>
				<div className={'font-mono font-bold text-xl'}>{formatNumber(report.tvl, 2, '', true)}</div>
				<div className={'font-mono text-xs'}>{formatPercent(report.tvl / ytvl)}</div>
			</Cell>
			<Cell group={report.riskGroup} category={'auditScore'} score={report.riskDetails.auditScore} />
			<Cell group={report.riskGroup} category={'codeReviewScore'} score={report.riskDetails.codeReviewScore} />
			<Cell group={report.riskGroup} category={'complexityScore'} score={report.riskDetails.complexityScore} />
			<Cell group={report.riskGroup} category={'longevityImpact'} score={report.riskDetails.longevityImpact} />
			<Cell group={report.riskGroup} category={'protocolSafetyScore'} score={report.riskDetails.protocolSafetyScore} />
			<Cell group={report.riskGroup} category={'teamKnowledgeScore'} score={report.riskDetails.teamKnowledgeScore} />
			<Cell group={report.riskGroup} category={'testingScore'} score={report.riskDetails.testingScore} />
			<Cell group={report.riskGroup} category={'median'} score={report.riskDetails.median} />
		</div>)}
	</>;
}
