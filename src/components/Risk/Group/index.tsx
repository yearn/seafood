import React, {useEffect, useMemo} from 'react';
import {useParams} from 'react-router-dom';
import {useVaults} from '../../../context/useVaults';
import {RiskCategories, RiskReport, Strategy, Vault} from '../../../context/useVaults/types';
import {Spinner} from '../../controls';
import Header from './Header';
import Score, {breakdowns} from '../Score';
import VaultSummary from './VaultSummary';
import {usePowertools} from '../../Powertools';
import Tabbed from '../../controls/Tabbed';
import {useChrome} from '../../Chrome';

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

function Scores() {
	const group = useRiskGroup();

	const report = useMemo(() => {
		if(!group.riskDetails) return {} as RiskCategories;
		const details = {...group.riskDetails};
		const keys = Object.keys(details);
		keys.forEach(key => {
			if(!(key in breakdowns)) delete (details as any)[key]; // eslint-disable-line
		});
		return details;
	}, [group]);

	return <div className={`px-2 sm:px-6
		grid grid-flow-row gap-2 grid-cols-1 
		sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4`}>
		{Object.keys(report).map(key => 
			<div key={key} className={'bg-secondary-100 dark:bg-black'}>
				<Score category={key} score={report[key as keyof (RiskCategories | 'median')]} />
			</div>
		)}
	</div>;
}

function Vaults() {
	const group = useRiskGroup();
	return <div className={`px-2 sm:px-6
		grid grid-flow-row gap-2 grid-cols-1 
		sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4`}>
		{group.vaults.map((v, index) => <VaultSummary key={index} 
			vault={v.vault} 
			strategies={v.strategies} 
		/>)}
	</div>;
}

export default function RiskGroup() {
	const group = useRiskGroup();
	const {setEnable} = usePowertools();
	const {scrollToTop} = useChrome();

	useEffect(() => scrollToTop(), [scrollToTop]);

	useEffect(() => {
		setEnable(false);
		return () => setEnable(true);
	}, [setEnable]);

	if(!group.riskDetails) return <div className={`
		absolute w-full h-screen flex items-center justify-center`}>
		<Spinner size={16} bloom={18} />
	</div>;

	return <div className={'w-full pb-20 sm:pt-2 flex flex-col gap-2'}>
		<Header group={group} />
		<div className={'w-full sm:px-8 flex flex-col gap-2'}>
			<Tabbed
				className={'px-4 sm:px-6 flex items-start gap-3'}
				tabClassName={`px-6 py-2
					border-b-4 
					border-secondary-200 hover:border-selected-400 active:border-selected-600
					dark:border-secondary-800 hover:dark:border-selected-500 active:dark:border-selected-700`}
				activeTabClassName={`px-6 py-2
					border-b-4 border-primary-400`}
				contentClassName={'py-6'}
				storageKey={'src/risk/group/tabs'}
				tabs={[
					{label: 'Scores', content: <Scores />},
					{label: 'Vaults', content: <Vaults />}
				]} />
		</div>
	</div>;
}
