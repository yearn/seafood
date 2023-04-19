import React, {ReactNode} from 'react';
import {BigNumber} from 'ethers';
import {formatBps, formatPercent, formatTokens} from '../../utils/utils';

export function Field(
	{value, simulated, className, children}: 
	{value: BigNumber | number | string, simulated?: boolean, className?: string, children?: ReactNode}) {
	if(!children) children = (typeof value === 'string' || typeof value === 'number') ? value : value.toString();
	if(typeof value === 'string') {
		return <div className={`
			text-right group-hover:text-current
			${simulated ? 'text-primary-600 dark:text-primary-400' : ''}
			${className}`}>
			{children}
		</div>;
	} else {
		const gte0 = BigNumber.isBigNumber(value) ? value.gte(0) : value >= 0;
		return <div className={`
			font-mono text-right group-hover:text-current
			${simulated ? gte0
		? 'text-primary-600 dark:text-primary-400' 
		: 'text-error-600 dark:text-error-400' : ''}
			${className}`}>
			{children}
		</div>;
	}
}

export function Bps(
	{value, className}
	: {value: number, className?: string}) {
	return <Field value={value} simulated={true} className={className}>
		{`${value > 0 ? '+' : ''}${formatBps(value)}`}
	</Field>;
}

export function Tokens(
	{value, decimals, simulated, className}
	: {value: BigNumber, decimals?: number, simulated?: boolean, className?: string}) {
	return <Field value={value} simulated={simulated} className={className}>
		{formatTokens(value, decimals, 2, true)}
	</Field>;
}

export function Percentage(
	{value, simulated, bps, decimals, className}
	: {value: number, simulated?: boolean, bps?: boolean, decimals?: number, className?: string}) {
	if(bps) value = value / 10_000;
	return <Field value={value} simulated={simulated} className={className}>
		{formatPercent(value, decimals)}
	</Field>;
}
