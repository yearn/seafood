import React, {ReactNode, useCallback, useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
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
import {useChrome} from '../../Chrome';
import {useMediumBreakpoint} from '../../../utils/breakpoints';

export default function FilterChip({
	hash,
	label,
	className, 
	children
}: {
	hash: string,
	label: string, 
	className?: string, 
	children?: ReactNode
}) {
	const location = useLocation();
	const navigate = useNavigate();
	const mediumBreakpoint = useMediumBreakpoint();
	const {setDialog} = useChrome();
	const [open, setOpen] = useState(false);

	const onClick = useCallback(() => {
		if(mediumBreakpoint) return;
		navigate(`${location.pathname}#${hash}`);
	}, [mediumBreakpoint, location, hash, navigate]);

	useEffect(() => {
		if(location.hash === `#${hash}`) {
			setDialog({
				Component: () => <>{children}</>
			});
		}
	}, [location, setDialog, hash, children]);

	const {x, y, refs, strategy, context} = useFloating({
		open,
		placement: 'bottom-end',
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

	return <button ref={refs.setReference}
		{...getReferenceProps()} 
		onClick={onClick}
		className={`
		h-10 items-center px-4 cursor-default border 

		${ mediumBreakpoint ? 'max-w-[45%] block text-ellipsis overflow-hidden' : 'flex'}

		${open && mediumBreakpoint
		? `bg-selected-300 text-selected-800
			dark:bg-selected-600 dark:text-black
			border-transparent`
		: `bg-primary-400/40 text-secondary-600 
			dark:bg-primary-900/40 dark:text-secondary-200
			border-primary-400 dark:border-primary-900`}

		text-sm capitalize outline-none
		whitespace-nowrap`}>
		{label}
		{open && mediumBreakpoint && <FloatingFocusManager context={context} modal={false}>
			<div ref={refs.setFloating} {...getFloatingProps()} className={`
				z-[100] w-max p-8 ml-[32px]
				bg-secondary-100 dark:bg-black
				border border-selected-200 dark:border-selected-900
				shadow-lg shadow-secondary-900/10 dark:shadow-black/80
				outline-none shadow-md
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
