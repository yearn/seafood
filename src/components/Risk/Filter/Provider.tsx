import React, {createContext, ReactNode, useContext, useMemo, useState} from 'react';
import {BigNumber} from 'ethers';
import config from '../../../config.json';
import {useVaults} from '../../../context/useVaults';
import {curveRe, escapeRegex} from '../../../utils/utils';
import {defaultRiskCategories, RiskCategories, RiskReport} from '../../../context/useVaults/types';

interface SummarizedRiskReport extends RiskReport {
	strategies: number,
	median: number,
	tvlUsd: number
}

function median(numbers: number[]) {
	const sorted = Array.from(numbers).sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	if (sorted.length % 2 === 0) {
		return (sorted[middle - 1] + sorted[middle]) / 2;
	}
	return sorted[middle];
}

function medianExlcudingTvlImpact(scores: RiskCategories) {
	const keys = Object.keys(scores);
	keys.splice(keys.indexOf('TVLImpact'), 1);
	const values = keys.map(key => scores[key as keyof RiskCategories]);
	return median(values);
}

function scoreTvlImpact(tvl: number): number {
	if (tvl === 0)
		return 0;
	if (tvl < 1_000_000)
		return 1;
	if (tvl < 10_000_000)
		return 2;
	if (tvl < 50_000_000)
		return 3;
	if (tvl < 100_000_000)
		return 4;
	return 5;
}

export interface StrategyFilter {
	gtZeroDebt: boolean,
	hideInactive: boolean,
	hideCurve: boolean
}

export function defaultStrategyFilter() {
	return {
		gtZeroDebt: true, 
		hideInactive: true, 
		hideCurve: false
	} as StrategyFilter;
}

export interface ScoreRange {
	min: 1 | 2 | 3 | 4;
	max: 5 | 4 | 3 | 2;
}

export interface ScoresFilter {
	TVLImpact: ScoreRange,
	auditScore: ScoreRange,
	codeReviewScore: ScoreRange,
	complexityScore: ScoreRange,
	longevityImpact: ScoreRange,
	protocolSafetyScore: ScoreRange,
	teamKnowledgeScore: ScoreRange,
	testingScore: ScoreRange,
	median: ScoreRange
}

export function defaultScoresFilter() {
	return {
		TVLImpact: {min: 1, max: 5},
		auditScore: {min: 1, max: 5},
		codeReviewScore: {min: 1, max: 5},
		complexityScore: {min: 1, max: 5},
		longevityImpact: {min: 1, max: 5},
		protocolSafetyScore: {min: 1, max: 5},
		teamKnowledgeScore: {min: 1, max: 5},
		testingScore: {min: 1, max: 5},
		median: {min: 1, max: 5}
	} as ScoresFilter;
}

export interface Sort {
	key: string,
	direction: 'asc' | 'desc'
}

export function defaultSort() {
	return {
		key: 'TVLImpact',
		direction: 'desc'
	} as Sort;
}

interface Filter {
	risk: SummarizedRiskReport[],
	totalTvlUsd: number,
	totalStrategies: number,
	totalMedianRisks: RiskCategories,
	query: string,
	setQuery: React.Dispatch<React.SetStateAction<string>>,
	queryRe: RegExp,
	networks: number[],
	setNetworks:  React.Dispatch<React.SetStateAction<number[]>>,
	strategies: StrategyFilter,
	setStrategies: React.Dispatch<React.SetStateAction<StrategyFilter>>,
	scores: ScoresFilter,
	setScores: React.Dispatch<React.SetStateAction<ScoresFilter>>,
	sort: Sort,
	setSort: React.Dispatch<React.SetStateAction<Sort>>
}

const FilterContext = createContext<Filter>({
	risk: [],
	totalTvlUsd: 0,
	totalStrategies: 0,
	totalMedianRisks: defaultRiskCategories(),
	query: '',
	setQuery: () => undefined,
	queryRe: new RegExp(''),
	networks: [],
	setNetworks: () => undefined,
	strategies: defaultStrategyFilter(),
	setStrategies: () => undefined,
	scores: defaultScoresFilter(),
	setScores: () => undefined,
	sort: defaultSort(),
	setSort: () => undefined
});

export const useFilter = () => useContext(FilterContext);

export default function FilterProvider({children}: {children: ReactNode}) {
	const {vaults} = useVaults();
	const [risk, setRisk] = useState([] as SummarizedRiskReport[]);
	const [totalTvlUsd, setTotalTvlUsd] = useState(0);
	const [totalStrategies, setTotalStrategies] = useState(0);
	const [totalMedianRisks, setTotalMedianRisks] = useState<RiskCategories>(defaultRiskCategories());
	const [query, setQuery] = useState('');
	const queryRe = useMemo(() => { return new RegExp(escapeRegex(query), 'i'); }, [query]);
	const [networks, setNetworks] = useState(config.chains.map(chain => chain.id));
	const [strategies, setStrategies] = useState<StrategyFilter>(defaultStrategyFilter());
	const [scores, setScores] = useState<ScoresFilter>(defaultScoresFilter());
	const [sort, setSort] = useState(defaultSort());

	function inRange(score: number, range: ScoreRange) {
		if(range.min === 1 && score === 0) return true;
		return score >= range.min && score <= range.max;
	}

	React.useEffect(() => {
		let totalTvlUsd = 0;
		let totalStrategies = 0;
		let risk = [] as SummarizedRiskReport[];

		vaults
			.filter(vault => networks.includes(vault.network.chainId))
			.forEach(vault => vault.strategies.forEach(strategy => {
				if(!strategy.risk) return;
				if(query && !queryRe.test(strategy.risk.riskGroup)) return;
				if(strategies.hideInactive && strategy.risk.riskGroup === 'Inactive') return;
				if(strategies.hideCurve && curveRe.test(vault.name)) return;

				const debt = strategy.totalDebt.div(BigNumber.from('10').pow(vault.decimals)).toNumber();
				if(strategies.gtZeroDebt && debt <= 0) return;

				const medianScore = medianExlcudingTvlImpact(strategy.risk.riskDetails);
				for(const key of Object.keys(scores)) {
					const range = scores[key as keyof ScoresFilter];
					if(key === 'median') {
						if(!inRange(medianScore, range)) return;
					} else if (key !== 'TVLImpact') {
						const score = strategy.risk.riskDetails[key as keyof RiskCategories];
						if(!inRange(score, range)) return;
					}
				}

				const debtUsd = debt * vault.price;
				totalTvlUsd += debtUsd;

				let report = risk.find(r => r.riskGroup === strategy.risk.riskGroup);
				if(!report) {
					report = {
						...strategy.risk,
						strategies: 1,
						median: medianScore,
						tvlUsd: debtUsd
					};
					risk.push(report);
				} else {
					report.strategies++;
					report.tvlUsd += debtUsd;
					totalStrategies++;
				}
			}));

		risk.forEach(report => {
			report.riskDetails.TVLImpact = scoreTvlImpact(report.tvlUsd);
		});

		risk = risk.filter(report => inRange(report.riskDetails.TVLImpact || 1, scores.TVLImpact));

		risk.sort((a, b) => {
			if(sort.key !== 'TVLImpact') {
				const aValue = sort.key === 'median' ? a.median
					: a.riskDetails[sort.key as keyof RiskCategories];
				const bValue = sort.key === 'median' ? b.median
					: b.riskDetails[sort.key as keyof RiskCategories];
				if(aValue !== bValue) {
					return sort.direction === 'asc'
						? aValue - bValue
						: bValue - aValue;
				}
			}

			if(b.tvlUsd !== a.tvlUsd) {
				if(sort.key === 'TVLImpact') {
					return sort.direction === 'asc'
						? a.tvlUsd - b.tvlUsd
						: b.tvlUsd - a.tvlUsd;
				}
				return b.tvlUsd - a.tvlUsd;
			} else {
				return a.riskGroup.localeCompare(b.riskGroup);
			}
		});

		setRisk(risk);
		setTotalTvlUsd(totalTvlUsd);
		setTotalStrategies(totalStrategies);

		const totalMedianRisks: RiskCategories = defaultRiskCategories();
		if(risk.length > 0) {
			Object.keys(risk[0].riskDetails).forEach(category => {
				totalMedianRisks[category as keyof RiskCategories] = median(
					risk.map(report => report.riskDetails[category as keyof RiskCategories])
				);
			});
		}
		setTotalMedianRisks(totalMedianRisks);
	}, [vaults, query, queryRe, networks, strategies, scores, sort]);

	return <FilterContext.Provider value={{
		risk,
		totalTvlUsd,
		totalStrategies,
		totalMedianRisks,
		query, setQuery, queryRe,
		networks, setNetworks,
		strategies, setStrategies,
		scores, setScores,
		sort, setSort
	}}>
		{children}
	</FilterContext.Provider>;
}
