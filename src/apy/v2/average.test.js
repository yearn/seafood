const compute = require('./average').default;
const config = require('../../config');
const ethers = require('ethers');
const abis = require('../../abi');

describe('APY', () => {
	test('yvUSDT 0.4.3 @ block 15871070', async function() {
		const yvUSDT = {
			address: '0x3B27F92C0e212C671EA351827EDF93DB27cc0c65',
			activation: ethers.BigNumber.from(1655484586),
			performanceFee: ethers.BigNumber.from(2000),
			managementFee: ethers.BigNumber.from(0),
			apiVersion: '0.4.3',
			strategies: [
				{address: '0x016919386387898E4Fa87c7c4D3324F75f178F12', debtRatio: ethers.BigNumber.from(0), performanceFee: ethers.BigNumber.from(0)},
				{address: '0xeAD650E673F497CdBE365F7a855273BbB468e454', debtRatio: ethers.BigNumber.from(3000), performanceFee: ethers.BigNumber.from(0)},
				{address: '0x087794F304aEB337388a40e7c382A0fEa78c47fC', debtRatio: ethers.BigNumber.from(0), performanceFee: ethers.BigNumber.from(0)},
				{address: '0x1de1401c71362C05C680c5Fd073888719d8f4196', debtRatio: ethers.BigNumber.from(1450), performanceFee: ethers.BigNumber.from(0)},
				{address: '0xBc04eFD0D18685BA97cFAdE4e2D3171701B4099c', debtRatio: ethers.BigNumber.from(5550), performanceFee: ethers.BigNumber.from(0)}
			]
		};
		const samples = {
			[0]: 15871070,
			[-7]: 15820963,
			[-30]: 15649186,
			inception: 15243268
		};
		const provider = new ethers.providers.JsonRpcProvider(config.chains.find(c => c.id === 1).providers[0]);
		const vaultRpc = new ethers.Contract(yvUSDT.address, abis.vault043, provider);
		const apy = await compute(yvUSDT, vaultRpc, samples);

		expect(apy[-7]).toEqual(0.009051418646107257);
		expect(apy[-30]).toEqual(0.00822217701338479);
		expect(apy.inception).toEqual(0.007697361270727177);
		expect(apy.net).toEqual(0.00822217701338479);
		expect(apy.gross).toEqual(0.01023650479351268);
	});
});