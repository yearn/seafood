import {BigNumber, FixedNumber} from 'ethers';
import {Strategy, Vault} from '../context/useVaults/types';

const HOURS_IN_A_YEAR = FixedNumber.from(24 * 365);
const BPS = FixedNumber.from(10_000);
const ONE = FixedNumber.from(1);

export function computeStrategyApr(vault: Vault, strategy: Strategy, snapshot: {totalGain: BigNumber, totalLoss: BigNumber}){
	if(!snapshot) return {gross: 0, net: 0};

	if(strategy.totalDebt.eq(0)) {
		if(strategy.estimatedTotalAssets.gt(0)) {
			return {gross: Infinity, net: Infinity};
		} else {
			return {gross: 0, net: 0};
		}
	}

	const profit = snapshot.totalGain.sub(strategy.totalGain);
	const loss = snapshot.totalLoss.sub(strategy.totalLoss);

	const pnlToDebt = (loss > profit)
		? FixedNumber.from(loss.mul(-1)).divUnsafe(FixedNumber.from(strategy.totalDebt))
		: FixedNumber.from(profit).divUnsafe(FixedNumber.from(strategy.totalDebt));

	const hoursSinceLastReport = BigNumber.from(Math.round(Date.now() / 1000)).sub(strategy.lastReport).div(60).div(60).toNumber();
	const annualizedPnlToDebt = pnlToDebt.mulUnsafe(HOURS_IN_A_YEAR.divUnsafe(FixedNumber.from(hoursSinceLastReport)));

	const performanceFee = FixedNumber.from(vault.performanceFee).divUnsafe(BPS);
	const managementFee = FixedNumber.from(vault.managementFee).divUnsafe(BPS);
	const delegatedToDebt = FixedNumber.from(strategy.delegatedAssets).divUnsafe(FixedNumber.from(strategy.totalDebt));

	const netAnnualizedPnlToDebt = annualizedPnlToDebt.mulUnsafe(ONE.subUnsafe(performanceFee))
		.subUnsafe(managementFee.mulUnsafe(ONE.subUnsafe(delegatedToDebt)));

	return {
		gross: annualizedPnlToDebt.toUnsafeFloat(),
		net: Math.max(netAnnualizedPnlToDebt.toUnsafeFloat(), 0)
	};
}
