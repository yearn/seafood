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
			min-w-[138px] h-16 flex items-center justify-center
			border-2 border-transparent hover:border-secondary-100 dark:hover:border-secondary-900
			rounded-sm cursor-default
			${scoreToBgColor(score)} ${className}`}>
		{children}
		{floatie.open && mediumBreakpoint && <FloatingFocusManager context={floatie.context} modal={false}>
			<div ref={floatie.refs.setFloating} {...floatie.getFloatingProps()} className={`
				z-[100] p-4
				flex flex-col
				bg-secondary-100 dark:bg-secondary-900
				shadow-md rounded-lg
				outline-none transition duration-200
				${category === 'median' ? 'w-64' : 'w-96'}
        ${className}`}
			style={floatie.style}>
				<Score group={group} category={category} score={score} />
			</div>
		</FloatingFocusManager>}
	</div>;
}
