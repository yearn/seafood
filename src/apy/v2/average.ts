import {BigNumber, Contract, FixedNumber} from 'ethers';
import {compare} from 'compare-versions';

export interface Strategy {
	address: string,
	debtRatio: BigNumber | undefined,
	performanceFee: BigNumber
}

export interface Vault {
	address: string,
	activation: BigNumber
	performanceFee: BigNumber,
	managementFee: BigNumber,
	apiVersion: string,
	strategies: Strategy[]
}

export interface BlockSample {
	[0]: number,
	[-7]: number,
	[-30]: number,
	inception: number
}

export interface PpsSample {
	block: number,
	pps: BigNumber
}

export interface Apy {
	gross: number,
	net: number,
	[-7]: number,
	[-30]: number,
	inception: number,
	pps: BigNumber
}

function computeApy(before: PpsSample, after: PpsSample, blocksPerDay: number) {
	const days = (after.block - before.block) / blocksPerDay;
	const ppsDelta = FixedNumber.from(after.pps.sub(before.pps)).divUnsafe(FixedNumber.from(before.pps || 1)).toUnsafeFloat();
	const annualizedPpsDelta = Math.pow(1 + ppsDelta, 365.2425 / days) - 1;
	return annualizedPpsDelta;
}

export default async function compute(
	vault: Vault,
	vaultRpc: Contract,
	samples: BlockSample
) {

	const pps = {
		[0]: await vaultRpc.pricePerShare({blockTag: samples[0]}),
		[-7]: BigNumber.from(0),
		[-30]: BigNumber.from(0),
		inception: await vaultRpc.pricePerShare({blockTag: samples.inception})
	};

	if (pps[0] === pps.inception) throw 'No price change since inception';

	pps[-7] = samples[-7] > samples.inception
		? await vaultRpc.pricePerShare({blockTag: samples[-7]})
		: pps.inception;

	pps[-30] = samples[-30] > samples.inception
		? await vaultRpc.pricePerShare({blockTag: samples[-30]})
		: pps.inception;

	const blocksPerDay = Math.floor((samples[0] - samples[-7]) / 7);

	const apy = {
		[-7]: computeApy(
			{block: samples[-7], pps: pps[-7]},
			{block: samples[0], pps: pps[0]},
			blocksPerDay),
		[-30]: computeApy(
			{block: samples[-30], pps: pps[-30]},
			{block: samples[0], pps: pps[0]},
			blocksPerDay),
		inception: computeApy(
			{block: samples.inception, pps: pps.inception},
			{block: samples[0], pps: pps[0]},
			blocksPerDay),
		net: 0,
		gross: 0,
		pps: pps[0]
	} as Apy;

	const netApyCandidates = [];
	if((await vaultRpc.provider.getNetwork()).chainId === 250) {
		netApyCandidates.push(apy[-7], apy[-30]);
	} else {
		netApyCandidates.push(apy[-30], apy[-7]);
	}

	const day = 24 * 60 * 60;
	const now = Math.floor(Date.now() / 1000);
	if(vault.activation.gt(now - 60 * day)) netApyCandidates.push(apy.inception);
	apy.net = netApyCandidates.find(apy => apy > 0) || 0;

	const strategistFees = vault.strategies
		.map(strategy => strategy.debtRatio?.mul(strategy.performanceFee) || BigNumber.from(0))
		.reduce((a: BigNumber, b: BigNumber) => a.add(b), BigNumber.from(0));

	const performanceFee = strategistFees.add(vault.performanceFee).toNumber() / 10_000;
	const managementFee = vault.managementFee.toNumber() / 10_000;

	const annualCompoundingPeriods = 52;
	const netApr = apy.net > 0
		? annualCompoundingPeriods * Math.pow(apy.net + 1, 1 / annualCompoundingPeriods) - annualCompoundingPeriods
		: apy.net;

	apy.gross = performanceFee === 1
		? netApr + managementFee
		: netApr / (1 - performanceFee) + managementFee;

	if(apy.net < 0 && compare(vault.apiVersion, '0.3.5', '>=')) {
		apy.net = 0;
	}

	return apy;
}