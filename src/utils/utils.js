export function GetExplorerLink(provider, address){
	return (provider.network.chainId === 250 ? 'https://ftmscan.com/address/' :  'https://etherscan.io/address/') + address;
}

export function TruncateAddress(address) {
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
}