
function GetExplorerLink(provider, address){
	return (provider.network.chainId === 250 ? 'https://ftmscan.com/address/' :  'https://etherscan.io/address/') + address;

}

function GetExplorerTx(provider, address){
	return (provider.network.chainId === 250 ? 'https://ftmscan.com/tx/' :  'https://etherscan.io/tx/') + address;

}

export {GetExplorerLink, GetExplorerTx};