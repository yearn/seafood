import React from 'react';

function GetExplorerLink(chainId, address){
	return (chainId === 250 ? 'https://ftmscan.com/address/' :  'https://etherscan.io/address/') + address;

}

function GetExplorerTx(chainId, address){
	return (chainId === 250 ? 'https://ftmscan.com/tx/' :  'https://etherscan.io/tx/') + address;

}

function GetALink(url, str){
	return <a target={'_blank'} rel={'noreferrer'} href={url}> {str}</a>;

}

function TruncateAddress(address) {
	return `${address.slice(0, 6)}...${address.slice(-4)}`;

}

function FormatNumer(number){
	return number.toLocaleString(undefined, {maximumFractionDigits:2});
}

function FormatPercent(number){
	return (number*100).toLocaleString(undefined, {maximumFractionDigits:2}) + '%';
}

export {GetExplorerLink, GetExplorerTx, GetALink, TruncateAddress, FormatNumer, FormatPercent};
