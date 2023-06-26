import React, {ReactNode} from 'react';

export default function Row({
	label,
	alt,
	heading,
	title,
	className,
	children
}: {
	label?: ReactNode,
	alt?: boolean,
	heading?: boolean
	title?: string,
	className?: string,
	children?: ReactNode
}) {
	return <div title={title} className={`
		px-2 py-1 flex items-center justify-between
		${alt ? 'bg-selected-400/5' : ''}
		${heading ? 'mt-2 border-t dark:border-primary-900/40': ''}
		${className}`}>
		{label}{children}
	</div>;
}
