import * as yDaemon from '../types.ydaemon';
import * as Seafood from '../types';
import {BigNumber} from 'ethers';
import {medianExlcudingTvlImpact, riskGroupNameToId} from '../risk';

function totalDebtUSD(vault: yDaemon.Vault, strategy: yDaemon.Strategy) {
	if(!strategy.details.totalDebt) return 0;
	const debt = BigNumber.from(strategy.details.totalDebt || 0);
	return vault.tvl.price * debt.div(BigNumber.from('10').pow(vault.decimals)).toNumber();
}

function mergeStrategy(target: Seafood.Strategy, source: yDaemon.Strategy, vault: yDaemon.Vault, chain: Seafood.Chain) : Seafood.Strategy {
	return {
		...target,
		network: {
			chainId: chain.id,
			name: chain.name
		},
		address: source.address,
		name: source.name,
		description: source.description,
		risk: {
			...source.risk, 
			riskGroupId: riskGroupNameToId(source.risk.riskGroup),
			tvl: 0,
			riskDetails: {
				...source.risk.riskDetails,
				median: medianExlcudingTvlImpact({...source.risk.riskDetails, median: 0})
			}
		},
		delegatedAssets: BigNumber.from(source.details.delegatedAssets || 0),
		estimatedTotalAssets: BigNumber.from(source.details.estimatedTotalAssets || 0),
		performanceFee: source.details.performanceFee,
		activation: source.details.activation,
		debtRatio: BigNumber.from(source.details.debtRatio || 0),
		lastReport: BigNumber.from(source.details.lastReport || 0),
		totalDebt: BigNumber.from(source.details.totalDebt || 0),
		totalDebtUSD: totalDebtUSD(vault, source),
		totalGain: BigNumber.from(source.details.totalGain || 0),
		totalLoss: BigNumber.from(source.details.totalLoss || 0),
		withdrawalQueuePosition: source.details.withdrawalQueuePosition,
		healthCheck: source.details.healthCheck,
		doHealthCheck: source.details.doHealthCheck,
		keeper: source.details.keeper || undefined
	};
}

function mergeStrategies(target: Seafood.Strategy[], source: yDaemon.Strategy[], vault: yDaemon.Vault, chain: Seafood.Chain) : Seafood.Strategy[] {
	const result = target.filter(t => source.find(s => s.address === t.address));
	for(let i = 0; i < result.length; i++) {
		const _source = source.find(s => s.address === result[i].address);
		result[i] = mergeStrategy(result[i], _source as yDaemon.Strategy, vault, chain);
	}
	const additions = source.filter(s => !result.find(r => r.address === s.address));
	result.push(...additions.map(s => mergeStrategy(Seafood.defaultStrategy, s, vault, chain)));
	return result;
}

export default function merge(target: Seafood.Vault, source: yDaemon.Vault, chain: Seafood.Chain) : Seafood.Vault {
	const sourceWithdrawalQueue = source.strategies
		.filter(s => s.details.withdrawalQueuePosition > -1)
		.sort((a, b) => a.details.withdrawalQueuePosition - b.details.withdrawalQueuePosition);

	return {
		...target,
		address: source.address,
		name: source.name,
		price: source.tvl.price,
		network: {
			chainId: chain.id,
			name: chain.name
		},
		version: source.version,
		want: source.token.address,
		token: {...source.token},
		governance: source.details.governance,
		decimals: source.decimals,
		managementFee: BigNumber.from(source.details.managementFee),
		performanceFee: BigNumber.from(source.details.performanceFee),
		depositLimit: BigNumber.from(source.details.depositLimit),
		activation: BigNumber.from(source.inception),
		strategies: mergeStrategies(target.strategies, source.strategies, source, chain),
		withdrawalQueue: mergeStrategies(target.withdrawalQueue, sourceWithdrawalQueue, source, chain),
		apy: {
			type: source.apy.type,
			gross: source.apy.gross_apr,
			net: source.apy.net_apy,
			[-7]: source.apy.points.week_ago,
			[-30]: source.apy.points.month_ago,
			inception: source.apy.points.inception
		},
	};
}
