import * as Seafood from './types';

export function riskGroupNameToId(name: string) {
	return name
		.replace(/[^a-zA-Z0-9 ]/g, '')
		.replace(/ /g, '-')
		.toLowerCase();
}

export function median(numbers: number[]) {
	const sorted = Array.from(numbers).sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	if (sorted.length % 2 === 0) {
		return (sorted[middle - 1] + sorted[middle]) / 2;
	}
	return sorted[middle];
}

export function medianExlcudingTvlImpact(scores: Seafood.RiskCategories) {
	const keys = Object.keys(scores);
	keys.splice(keys.indexOf('TVLImpact'), 1);
	keys.splice(keys.indexOf('median'), 1);
	const values = keys.map(key => scores[key as keyof Seafood.RiskCategories]);
	return median(values);
}

export function scoreTvlImpact(tvl: number): number {
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

export function computeLongevityScore(strategy: Seafood.Strategy) {
	if(!strategy.activation || strategy.activation.isZero()) return 5;
	const activationUnix = strategy.activation.toNumber();
	const longevity = Date.now() - activationUnix;
	const days = 24 * 60 * 60 * 1000;
	switch (true) {
	case longevity > 240 * days:
		return 1;
	case longevity > 120 * days:
		return 2;
	case longevity > 30 * days:
		return 3;
	case longevity > 7 * days:
		return 4;
	default:
		return 5;
	}
}

export function aggregateRiskGroupTvls(vaults: Seafood.Vault[]) {
	const debts = vaults.map(v => v.strategies.map(s => ({
		group: s.risk.riskGroupId,
		debt: s.totalDebtUSD
	}))).flat();

	/* eslint-disable @typescript-eslint/no-explicit-any */
	const groupTvls = {} as any;

	debts.forEach(debt => {
		groupTvls[debt.group] = groupTvls[debt.group] 
			? groupTvls[debt.group] + debt.debt
			: debt.debt;
	});

	vaults.forEach(v => v.strategies.forEach(s => {
		s.risk.tvl = groupTvls[s.risk.riskGroupId];
		s.risk.riskDetails.TVLImpact = scoreTvlImpact(groupTvls[s.risk.riskGroupId]);
		const queued = v.withdrawalQueue.find(q => q.address === s.address);
		if(queued) {
			queued.risk.tvl = groupTvls[s.risk.riskGroupId];
			queued.risk.riskDetails.TVLImpact = scoreTvlImpact(groupTvls[s.risk.riskGroupId]);
		}
	}));
}
