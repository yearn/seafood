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
				'wss://erigon:iAlBsaOWZtIrYNMR4a4J@node.yearn.network',
				'wss://erigon:FcqDXWV3TEwS2-r3@erigon.yearn.vision'
			]
		},
		{
			'id': chainIds.fantom,
			'name': 'fantom',
			'explorer': 'https://ftmscan.com',
			'providers': [
				'wss://opera:zgNmpZno8CFXCVvHm7I2JZ6NETmEotAA@fantom.yearn.science'
			]
		}
	]
};