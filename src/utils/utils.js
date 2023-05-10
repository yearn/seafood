import React from 'react';
import {ethers} from 'ethers';
import config from '../config';

const curveRe = /curve|crv/i;
const factoryRe = /factory/i;

function chainId(name) {
	return config.chains.find(chain => chain.name === name)?.id;
}

function getChain(chainId) {
	return config.chains.find(chain => chain.id === chainId);
}

function getAddressExplorer(chainId, address){
	const chain = getChain(chainId);
	return `${chain.explorer}/address/${address}`;
}

function getTxExplorer(chainId, hash){
	const chain = getChain(chainId);
	return `${chain.explorer}/tx/${hash}`;
}

function getEigenTxExplorer(hash) {
	return `https://eigenphi.io/mev/eigentx/${hash}`;
}

function truncateAddress(address) {
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatNumber(number, decimals = 2, nonFinite = '∞', compact = false) {
	if(Number.isFinite(number)) {
		let magnitude = '';
		if(compact) {
			if(Math.abs(number) >= 1_000_000_000) {
				magnitude = 'b';
				number = number / 1_000_000_000;
			} else if(Math.abs(number) >= 1_000_000) {
				magnitude = 'm';
				number = number / 1_000_000;
			} else if(Math.abs(number) >= 1_000) {
				magnitude = 'k';
				number = number / 1_000;
			}
		}

		const formatted =  number.toLocaleString(
			navigator?.language, 
			{
				minimumFractionDigits: decimals, 
				maximumFractionDigits: decimals
			}
		);

		return `${formatted}${magnitude ? magnitude : ''}`;

	} else {
		return nonFinite;
	}
}

function formatPercent(number, decimals = 2, nonFinite = '∞') {
	if(Number.isFinite(number))
		return number.toLocaleString(
			navigator?.language, 
			{
				style: 'percent', 
				minimumFractionDigits: decimals, 
				maximumFractionDigits: decimals
			});
	else
		return nonFinite;
}

function formatBps(number, nonFinite = '∞') {
	if(Number.isFinite(number))
		return `${Math.round(number * 10_000)}bps`;
	else
		return nonFinite;
}

function formatCurrency(number, currency = 'USD', nonFinite = '∞') {
	if(Number.isFinite(number))
		return number.toLocaleString(
			navigator?.language, 
			{
				style: 'currency', 
				currency
			});
	else
		return nonFinite;
}

function formatTokens(tokens, tokenDecimals, decimals = 2, compact = false) {
	return formatNumber(tokens / 10 ** tokenDecimals, decimals, '∞', compact);
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

async function fetchAbi(chainId, contract) {
	const url = `/api/abi?chainId=${chainId}&contract=${contract}`;
	return await(await fetch(url)).json();
}

function hydrateBigNumbersRecursively(object, depth = 1) {
	if(Array.isArray(object)) {
		object.forEach(o => hydrateBigNumbersRecursively(o, depth + 1));
	} else {
		Object.keys(object).forEach(key => {
			const value = object[key];
			if(value && typeof value === 'object') {
				if(value.type === 'BigNumber') {
					object[key] = ethers.BigNumber.from(value.hex);
				} else if (value._isBigNumber) {
					object[key] = ethers.BigNumber.from(value._hex);
				} else {
					hydrateBigNumbersRecursively(value, depth + 1);
				}
			}
		});
	}
}

function escapeRegex(string) {
	return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}

function humanizeRiskCategory(category) {
	if(category === 'TVLImpact') return 'TVL Impact';
	if(category === 'longevityImpact') return 'Longevity';
	const reg = /([a-z0-9])([A-Z])/g;
	const raw = category.replace(reg, '$1 $2').replace(' Score', '');
	const capitalized = raw.toLowerCase().split(' ')
		.map((s) => s.charAt(0).toUpperCase() + s.substring(1))
		.join(' ');
	return capitalized;
}

function isEthAddress(string) {
	return /0x[a-fA-F0-9]{40}/.test(string);
}

export {
	chainId,
	getChain,
	curveRe,
	factoryRe,
	getAddressExplorer, 
	getTxExplorer,
	getEigenTxExplorer,
	truncateAddress, 
	formatNumber, 
	formatPercent,
	formatBps,
	formatCurrency,
	formatTokens,
	highlightString,
	fetchAbi,
	hydrateBigNumbersRecursively,
	escapeRegex,
	humanizeRiskCategory,
	isEthAddress
};