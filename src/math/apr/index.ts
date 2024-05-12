import {BigNumber, FixedNumber} from 'ethers';
import {Strategy, Vault} from '../../context/useVaults/types';
import {HOURS_IN_A_YEAR, BPS, ONE} from '../../constants';
import {HarvestReport} from '../../utils/vaults';

export function computeHarvestApr(vault: Vault, strategy: Strategy, latestReport: HarvestReport, snapshot: {gain: BigNumber, loss: BigNumber}){
	if(!snapshot) return {gross: 0, net: 0};

	if(strategy.totalDebt.eq(0)) {
		if(strategy.estimatedTotalAssets.gt(0)) {
			return {gross: Infinity, net: Infinity};
		} else {
			return {gross: 0, net: 0};
		}
	}

	const profit = snapshot.gain;
	const loss = snapshot.loss;

	const performance = (loss > profit)
		? FixedNumber.from(loss.mul(-1)).divUnsafe(FixedNumber.from(strategy.totalDebt))
		: FixedNumber.from(profit).divUnsafe(FixedNumber.from(strategy.totalDebt));

	const period = BigNumber.from(Math.floor(Date.now() / 1000)).sub(Math.floor(parseInt(latestReport.timestamp))).div(60).div(60).toNumber() || 1;
	const gross = performance.mulUnsafe(HOURS_IN_A_YEAR.divUnsafe(FixedNumber.from(period)));

	const performanceFee = FixedNumber.from(vault.performanceFee).divUnsafe(BPS);
	const managementFee = FixedNumber.from(vault.managementFee).divUnsafe(BPS);
	const delegateRatio = FixedNumber.from(strategy.delegatedAssets).divUnsafe(FixedNumber.from(strategy.totalDebt));

	const net = gross.mulUnsafe(ONE.subUnsafe(performanceFee))
		.subUnsafe(managementFee.mulUnsafe(ONE.subUnsafe(delegateRatio)));

	return {
		gross: gross.toUnsafeFloat(),
		net: Math.max(net.toUnsafeFloat(), 0)
	};
}
