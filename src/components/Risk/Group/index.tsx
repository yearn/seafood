import React, {useCallback, useEffect, useMemo} from 'react';
import {useParams} from 'react-router-dom';
import {useVaults} from '../../../context/useVaults';
import {RiskCategories, RiskReport, Strategy, Vault} from '../../../context/useVaults/types';
import {formatNumber} from '../../../utils/utils';
import {Spinner} from '../../controls';
import Header from './Header';
import Slider from './Slider';
import VaultSummary from './VaultSummary';
import {usePowertools} from '../../Powertools';

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
	const {setEnable} = usePowertools();

	useEffect(() => {
		setEnable(false);
		return () => setEnable(true);
	}, [setEnable]);

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

	return <div className={'w-full sm:px-[30%] pb-20 flex flex-col gap-2'}>
		<Header group={group} />
		<div className={'w-full flex flex-col gap-2'}>
			<div className={'px-8 sm:px-0'}>
				{Object.keys(report).map(key => <Slider key={key}
					group={group.riskGroup} 
					category={key}
					score={report[key as keyof (RiskCategories | 'median')]} 
					details={getSliderDetails(key)}
				/>)}
			</div>
			<div className={'mt-6 px-2 flex flex-col gap-3'}>
				{group.vaults.map((v, index) => <VaultSummary key={index} 
					vault={v.vault} 
					strategies={v.strategies} 
				/>)}
			</div>
		</div>
	</div>;
}
