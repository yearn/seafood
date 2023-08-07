import React, {ReactNode, useMemo} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {BigNumber} from 'ethers';
import {formatBps, formatNumber, formatPercent, formatTokens} from '../../utils/utils';

export function Field(
	{value, simulated, animate, className, children}: 
	{value: BigNumber | number | string, simulated?: boolean, animate?: boolean, className?: string, children?: ReactNode}) {

	const content = useMemo(() => {
		return children ? children : (typeof value === 'string' || typeof value === 'number') ? value : value.toString();
	}, [children, value]);

	const motionAttributes = useMemo(() => {
		return {
			key: `${value}-${simulated}`,
			transition: animate ? {type: 'spring', stiffness: 2200, damping: 32} : {},
			initial: animate ? {y: 4, opacity: 0} : {},
			animate: animate ? {y: 0, opacity: 1} : {},
			exit: animate ? {y: -4, opacity: 0} : {}
		};
	}, [value, simulated, animate]);

	if(typeof value === 'string') {
		return <AnimatePresence initial={false} mode={'wait'}>
			<motion.div 
				key={motionAttributes.key}
				transition={motionAttributes.transition}
				initial={motionAttributes.initial}
				animate={motionAttributes.animate}
				className={`text-right group-hover:text-current group-active:text-current
				${simulated ? 'text-primary-600 dark:text-primary-400' : ''}
				${className}`}>
				{content}
			</motion.div>
		</AnimatePresence>;
	} else {
		const gte0 = BigNumber.isBigNumber(value) ? value.gte(0) : isNaN(value) || value >= 0;
		return <AnimatePresence initial={false} mode={'wait'}>
			<motion.div 
				key={motionAttributes.key}
				transition={motionAttributes.transition}
				initial={motionAttributes.initial}
				animate={motionAttributes.animate}
				className={`font-mono text-right group-hover:text-current group-active:text-current
				${simulated ? gte0
		? 'text-primary-600 dark:text-primary-400' 
		: 'text-error-600 dark:text-error-400' : ''}
				${className}`}>
				{content}
			</motion.div>
		</AnimatePresence>;
	}
}

export function Number(
	{value, simulated, decimals, nonFinite, compact, sign, format, animate, className}
	: {value: number, simulated?: boolean, decimals?: number, nonFinite?: string, compact?: boolean, sign?: boolean, format?: string, animate?: boolean, className?: string}) {
	const result = useMemo(() => {
		const _ = `${sign ? (value < 0 ? '' : '+') : ''}${formatNumber(value, decimals, nonFinite, compact)}`;
		return format ? format.replace('%s', _) : _;
	}, [value, decimals, nonFinite, compact, sign, format]);
	return <Field value={value} simulated={simulated} animate={animate} className={className}>
		{result}
	</Field>;
}

export function Bps(
	{value, simulated, sign, format, animate, className}
	: {value: number, simulated?: boolean, sign?: boolean, format?: string, animate?: boolean, className?: string}) {
	const result = useMemo(() => {
		const _ = `${sign ? (value < 0 ? '' : '+') : ''}${formatBps(value)}`;
		return format ? format.replace('%s', _) : _;
	}, [value, sign, format]);
	return <Field value={value} simulated={simulated} animate={animate} className={className}>
		{result}
	</Field>;
}

export function Tokens(
	{value, simulated, decimals, accuracy, sign, nonFinite, format, animate, className}
	: {value: BigNumber, simulated?: boolean, decimals?: number, accuracy?: number, sign?: boolean, nonFinite?: string, format?: string, animate?: boolean, className?: string}) {
	const result = useMemo(() => {
		const _ = `${sign ? (value.lt(0) ? '' : '+') : ''}${formatTokens(value, decimals, accuracy || 2, true, nonFinite)}`;
		return format ? format.replace('%s', _) : _;
	}, [value, decimals, accuracy, sign, nonFinite, format]);
	return <Field value={value} simulated={simulated} animate={animate} className={className}>
		{result}
	</Field>;
}

export function Percentage(
	{value, simulated, bps, decimals, sign, nonFinite, format, animate, className}
	: {value: number, simulated?: boolean, bps?: boolean, decimals?: number, sign?: boolean, nonFinite?: string, format?: string, animate?: boolean, className?: string}) {
	const result = useMemo(() => {
		const _ = `${(sign && !isNaN(value)) ? (value < 0 ? '' : '+') : ''}${formatPercent(bps ? value / 10_000 : value, decimals, nonFinite)}`;
		return format ? format.replace('%s', _) : _;
	}, [value, bps, decimals, sign, nonFinite, format]);
	return <Field value={value} simulated={simulated} animate={animate} className={className}>
		{result}
	</Field>;
}
