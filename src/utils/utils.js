
function GetExplorerLink(provider, address){
	return (provider.network.chainId === 250 ? 'https://ftmscan.com/address/' :  'https://etherscan.io/address/') + address;

}

export {GetExplorerLink};