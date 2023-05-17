import React, {ReactNode, useMemo} from 'react';
import {BigNumber} from 'ethers';
import {formatBps, formatNumber, formatPercent, formatTokens} from '../../utils/utils';

export function Field(
	{value, simulated, className, children}: 
	{value: BigNumber | number | string, simulated?: boolean, className?: string, children?: ReactNode}) {
	if(!children) children = (typeof value === 'string' || typeof value === 'number') ? value : value.toString();
	if(typeof value === 'string') {
		return <div className={`
			text-right group-hover:text-current group-active:text-current
			${simulated ? 'text-primary-600 dark:text-primary-400' : ''}
			${className}`}>
			{children}
		</div>;
	} else {
		const gte0 = BigNumber.isBigNumber(value) ? value.gte(0) : value >= 0;
		return <div className={`
			font-mono text-right group-hover:text-current group-active:text-current
			${simulated ? gte0
		? 'text-primary-600 dark:text-primary-400' 
		: 'text-error-600 dark:text-error-400' : ''}
			${className}`}>
			{children}
		</div>;
	}
}

export function Number(
	{value, simulated, decimals, nonFinite, compact, sign, format, className}
	: {value: number, simulated?: boolean, decimals?: number, nonFinite?: string, compact?: boolean, sign?: boolean, format?: string, className?: string}) {
	const result = useMemo(() => {
		const _ = `${sign ? (value < 0 ? '' : '+') : ''}${formatNumber(value, decimals, nonFinite, compact)}`;
		return format ? format.replace('%s', _) : _;
	}, [value, decimals, nonFinite, compact, sign, format]);
	return <Field value={value} simulated={simulated} className={className}>
		{result}
	</Field>;
}

export function Bps(
	{value, simulated, sign, format, className}
	: {value: number, simulated?: boolean, sign?: boolean, format?: string, className?: string}) {
	const result = useMemo(() => {
		const _ = `${sign ? (value < 0 ? '' : '+') : ''}${formatBps(value)}`;
		return format ? format.replace('%s', _) : _;
	}, [value, sign, format]);
	return <Field value={value} simulated={simulated} className={className}>
		{result}
	</Field>;
}

export function Tokens(
	{value, simulated, decimals, accuracy, sign, format, className}
	: {value: BigNumber, simulated?: boolean, decimals?: number, accuracy?: number, sign?: boolean, format?: string, className?: string}) {
	const result = useMemo(() => {
		const _ = `${sign ? (value.lt(0) ? '' : '+') : ''}${formatTokens(value, decimals, accuracy || 2, true)}`;
		return format ? format.replace('%s', _) : _;
	}, [value, decimals, accuracy, sign, format]);
	return <Field value={value} simulated={simulated} className={className}>
		{result}
	</Field>;
}

export function Percentage(
	{value, simulated, bps, decimals, sign, format, className}
	: {value: number, simulated?: boolean, bps?: boolean, decimals?: number, sign?: boolean, format?: string, className?: string}) {
	const result = useMemo(() => {
		const _ = `${sign ? (value < 0 ? '' : '+') : ''}${formatPercent(bps ? value / 10_000 : value, decimals)}`;
		return format ? format.replace('%s', _) : _;
	}, [value, bps, decimals, sign, format]);
	return <Field value={value} simulated={simulated} className={className}>
		{result}
	</Field>;
}
