import React, {ReactNode} from 'react';

export default function Row({
	label, 
	alt, 
	heading,
	className,
	children
}: {
	label?: ReactNode, 
	alt?: boolean,
	heading?: boolean
	className?: string, 
	children: ReactNode
}) {
	return <div className={`
		px-2 py-1 flex items-center justify-between rounded 
		${alt ? 'bg-selected-400/5' : ''}
		${heading ? 'mt-2 border-t dark:border-primary-900/40': ''}
		${className}`}>
		<div>{label}</div>{children}
	</div>;
}