export const chainIds = {
	'ethereum': 1,
	'fantom': 250,
	'optimism': 10
};

export default {
	'tenderly': {
		'forkUrl': 'https://simulate.yearn.network/fork',
		'dashboardUrl': 'https://dashboard.tenderly.co/yearn/yearn-web/fork',
		'rpcUrl': 'https://rpc.tenderly.co/fork/'
	},
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
		},
		{
			'id': chainIds.optimism,
			'name': 'optimism',
			'explorer': 'https://optimistic.etherscan.io/',
			'providers': []
		}
	]
};