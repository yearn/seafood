import React, {ReactNode, useState} from 'react';
import {
	useFloating,
	autoUpdate,
	offset,
	flip,
	shift,
	useInteractions,
	FloatingFocusManager,
	useHover,
	safePolygon,
	useTransitionStyles
} from '@floating-ui/react';

export default function FilterChip({
	label, 
	className, 
	children
}: {
	label: string, 
	className?: string, 
	children?: ReactNode
}) {
	const [open, setOpen] = useState(false);

	const {x, y, refs, strategy, context} = useFloating({
		open,
		placement: 'bottom-start',
		onOpenChange: setOpen,
		middleware: [
			offset(16),
			flip({fallbackAxisSideDirection: 'end'}),
			shift()
		],
		whileElementsMounted: autoUpdate
	});

	const hover = useHover(context, {
		handleClose: safePolygon()
	});

	const {getReferenceProps, getFloatingProps} = useInteractions([
		hover
	]);

	const {styles} = useTransitionStyles(context, {
		duration: 200
	});

	return <button ref={refs.setReference} {...getReferenceProps()} className={`
		flex items-center px-4 py-1 cursor-default

		${open 
		? 'sm:bg-selected-300 sm:dark:bg-selected-600' 
		: `text-secondary-600 bg-secondary-200
			dark:text-secondary-200 dark:bg-primary-900/40`}

		text-sm capitalize rounded-lg
		transition duration-200
		focus-visible:outline-none`}>
		{label}
		{open && <FloatingFocusManager context={context} modal={false}>
			<div ref={refs.setFloating} {...getFloatingProps()} className={`
				z-[100] w-max p-8 -ml-[32px]
				bg-secondary-100 dark:bg-secondary-900
				shadow-md rounded-lg
				transition duration-200
				focus-visible:outline-none
        ${className}`}
			style={{
				...styles,
				position: strategy,
				top: y ?? 0,
				left: x ?? 0
			}}>
				{children}
			</div>
		</FloatingFocusManager>}
	</button>;
}
