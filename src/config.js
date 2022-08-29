export const chainIds = {
	'ethereum': 1,
	'fantom': 250
};

export default {
	'forkUrl': 'https://simulate.yearn.network/fork',
	'chains': [
		{
			'id': chainIds.ethereum,
			'name': 'ethereum',
			'explorer': 'https://etherscan.io',
			'providers': [
				'https://rpc.ankr.com/eth'
			]
		},
		{
			'id': chainIds.fantom,
			'name': 'fantom',
			'explorer': 'https://ftmscan.com',
			'providers': [
				'https://rpc.ankr.com/fantom'
			]
		}
	]
};