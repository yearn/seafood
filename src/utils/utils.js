import React from 'react';

const curveRe = /curve|crv/i;

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

function FormatNumer(number, decimals = 2){
	if(Number.isFinite(number))
		return number.toLocaleString(undefined, {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
	else
		return '--';
}

function FormatPercent(number, decimals = 2){
	if(Number.isFinite(number))
		return number.toLocaleString(undefined, {style: 'percent', minimumFractionDigits: decimals, maximumFractionDigits: decimals});
	else
		return '--';
}

function FormatCurrency(number, currency = 'USD') {
	if(Number.isFinite(number))
		return number.toLocaleString(undefined, {style: 'currency', currency});
	else
		return '--';
}

function highlightString(string, highlightRe) {
	const match = string.match(highlightRe);
	if (match) {
		const matchedText = match[0];
		const left = string.substring(0, match.index);
		const middle = string.substring(match.index, match.index + matchedText.length);
		const right = string.substring(match.index + matchedText.length);
		return <>
			{left}
			<span className={'rainbow-text'}>{middle}</span>
			{right}
		</>;
	}
	return string;
}

export {
	curveRe, 
	GetExplorerLink, 
	GetExplorerTx, 
	GetALink, 
	TruncateAddress, 
	FormatNumer, 
	FormatPercent, 
	FormatCurrency,
	highlightString
};