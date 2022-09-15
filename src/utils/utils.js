import React from 'react';
import config from '../config';

const curveRe = /curve|crv/i;

function chainId(name) {
	return config.chains.find(chain => chain.name === name)?.id;
}

function getAddressExplorer(chainId, address){
	const chain = config.chains.find(chain => chain.id === chainId);
	return `${chain.explorer}/address/${address}`;
}

function getTxExplorer(chainId, address){
	const chain = config.chains.find(chain => chain.id === chainId);
	return `${chain.explorer}/tx/${address}`;
}

function truncateAddress(address) {
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatNumber(number, decimals = 2, nonFinite = '∞'){
	if(Number.isFinite(number))
		return number.toLocaleString(undefined, {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
	else
		return nonFinite;
}

function formatPercent(number, decimals = 2, nonFinite = '∞'){
	if(Number.isFinite(number))
		return number.toLocaleString(undefined, {style: 'percent', minimumFractionDigits: decimals, maximumFractionDigits: decimals});
	else
		return nonFinite;
}

function formatCurrency(number, currency = 'USD', nonFinite = '∞') {
	if(Number.isFinite(number))
		return number.toLocaleString(undefined, {style: 'currency', currency});
	else
		return nonFinite;
}

function formatTokens(tokens, tokenDecimals, decimals = 2) {
	return formatNumber(tokens / 10 ** tokenDecimals, decimals);
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
	chainId,
	curveRe, 
	getAddressExplorer, 
	getTxExplorer, 
	truncateAddress, 
	formatNumber, 
	formatPercent, 
	formatCurrency,
	formatTokens,
	highlightString
};