import React, {ReactNode} from 'react';
import {BigNumber} from 'ethers';
import {formatPercent, formatTokens} from '../../utils/utils';

export function Field(
	{value, simulated, delta, className, children}: 
	{value: BigNumber | number | string, simulated?: boolean, delta?: number, className?: string, children?: ReactNode}) {
	if(!children) children = (typeof value === 'string' || typeof value === 'number') ? value : value.toString();
	if(typeof value === 'string') {
		return <div className={`
			text-right
			${simulated ? 'text-primary-600 dark:text-primary-400' : ''}
			${className}`}>
			{children}
		</div>;
	} else {
		const gt0 = BigNumber.isBigNumber(value) ? value.gt(0) : value > 0;
		const gte0 = BigNumber.isBigNumber(value) ? value.gte(0) : value >= 0;
		return <div className={`
			font-mono text-right
			${simulated ? gte0
		? 'text-primary-600 dark:text-primary-400' 
		: 'text-error-600 dark:text-error-400' : ''}
			${className}`}>
			{delta && gt0 ? '+' : '' }{children}
		</div>;
	}
}

export function Tokens(
	{value, decimals, simulated, delta, className}
	: {value: BigNumber, decimals?: number, simulated?: boolean, delta?: number, className?: string}) {
	return <Field value={value} simulated={simulated} delta={delta} className={className}>
		{formatTokens(value, decimals, 2, true)}
	</Field>;
}

export function Percentage(
	{value, simulated, delta, bps, decimals, className}
	: {value: number, simulated?: boolean, delta?: number, bps?: boolean, decimals?: number, className?: string}) {
	if(bps) value = value / 10_000;
	return <Field value={value} simulated={simulated} delta={delta} className={className}>
		{formatPercent(value, decimals)}
	</Field>;
}
