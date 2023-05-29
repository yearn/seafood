import React, {ReactNode} from 'react';
import {scoreToBgColor} from '../colors';
import {FloatingFocusManager} from '@floating-ui/react';
import {useMediumBreakpoint} from '../../../utils/breakpoints';
import Score, {useFloatie} from '../Score';

export default function Cell({
	group,
	category,
	score, 
	className, 
	children
} : {
	group: string,
	category: string,
	score: number, 
	className?: string, 
	children?: ReactNode
}) {
	const mediumBreakpoint = useMediumBreakpoint();
	const floatie = useFloatie(group, category, score, 'left');

	return <div 
		ref={floatie.refs.setReference} 
		{...floatie.getReferenceProps()} 
		onClick={floatie.openModal}
		className={`
			min-w-[138px] sm:min-w-0 h-16 flex items-center justify-center
			border-2 border-transparent hover:border-secondary-100 dark:hover:border-secondary-900
			cursor-default
			${scoreToBgColor(score)} ${className}`}>
		{children}
		{floatie.open && mediumBreakpoint && <FloatingFocusManager context={floatie.context} modal={false}>
			<div ref={floatie.refs.setFloating} {...floatie.getFloatingProps()} className={`
				z-[100] p-4
				flex flex-col
				bg-secondary-100 dark:bg-black
				border border-selected-200 dark:border-selected-900
				shadow-lg shadow-secondary-900/20 dark:shadow-black/60
				outline-none
				${category === 'median' ? 'w-64' : 'w-96'}
        ${className}`}
			style={floatie.style}>
				<Score group={group} category={category} score={score} />
			</div>
		</FloatingFocusManager>}
	</div>;
}
