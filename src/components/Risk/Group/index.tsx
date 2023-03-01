import React, {useCallback, useMemo} from 'react';
import {useParams} from 'react-router-dom';
import {useVaults} from '../../../context/useVaults';
import {RiskCategories, RiskReport, Strategy, Vault} from '../../../context/useVaults/types';
import {formatNumber} from '../../../utils/utils';
import {Spinner} from '../../controls';
import Header from './Header';
import Slider from './Slider';
import VaultSummary from './VaultSummary';

export interface RiskReportWithVaults extends RiskReport {
	vaults: {
		vault: Vault,
		strategies: Strategy[]
	}[]
}

function useRiskGroup() {
	const params = useParams();
	const {vaults} = useVaults();
	return useMemo<RiskReportWithVaults>(() => {
		if(!vaults.length) return {} as RiskReportWithVaults;

		const vaultsInGroup = [] as {
			vault: Vault,
			strategies: Strategy[]
		}[];

		vaults.forEach(vault => {
			const strategies = vault.strategies.filter(strategy => 
				strategy.risk.riskGroupId === params.group
			);
			if(strategies.length) vaultsInGroup.push({vault, strategies});
		});

		return {
			...vaultsInGroup[0]?.strategies[0].risk,
			vaults: vaultsInGroup
		};
	}, [params, vaults]);
}

export default function RiskGroup() {
	const group = useRiskGroup();

	const report = useMemo(() => {
		if(!group.riskDetails) return {} as RiskCategories;
		return group.riskDetails;
	}, [group]);

	const getSliderDetails = useCallback((category: string) => {
		if(category !== 'TVLImpact') return '';
		return `${formatNumber(group.tvl, 2, '', true)}`;
	}, [group]);

	if(!group.riskDetails) return <div className={`
		absolute w-full h-screen flex items-center justify-center`}>
		<Spinner />
	</div>;

	return <div className={'pb-4 flex flex-col gap-2'}>
		<Header group={group} />
		<div className={'w-full flex flex-col sm:flex-row gap-2'}>
			<div className={'sm:h-min sm:sticky sm:top-[110px] sm:z-0 sm:w-1/2 px-8 sm:px-12'}>
				{Object.keys(report).map(key => <Slider key={key}
					group={group.riskGroup} 
					category={key}
					score={report[key as keyof (RiskCategories | 'median')]} 
					details={getSliderDetails(key)}
				/>)}
			</div>
			<div className={'sm:w-1/2 mt-6 sm:-mt-16 px-2 sm:pr-16 flex flex-col gap-3'}>
				{group.vaults.map((v, index) => <VaultSummary key={index} 
					vault={v.vault} 
					strategies={v.strategies} 
				/>)}
			</div>
		</div>
	</div>;
}
