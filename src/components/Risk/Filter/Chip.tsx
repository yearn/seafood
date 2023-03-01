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
				component: () => children
			});
		} else if(location.hash.length === 0) {
			setDialog(null);
		}
	}, [location, setDialog, hash, children]);

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

	return <button ref={refs.setReference}
		{...getReferenceProps()} 
		onClick={onClick}
		className={`
		flex items-center px-4 py-1 cursor-default

		${open 
		? `bg-secondary-200 dark:bg-primary-900/40 
			sm:bg-selected-300 sm:dark:bg-selected-600` 
		: `text-secondary-600 bg-secondary-200
			dark:text-secondary-200 dark:bg-primary-900/40`}

		text-sm capitalize rounded-lg outline-none
		whitespace-nowrap transition duration-200`}>
		{label}
		{open && mediumBreakpoint && <FloatingFocusManager context={context} modal={false}>
			<div ref={refs.setFloating} {...getFloatingProps()} className={`
				z-[100] w-max p-8 -ml-[32px]
				bg-secondary-100 dark:bg-secondary-900
				shadow-lg shadow-secondary-900/40 dark:shadow-secondary-900/60
				outline-none shadow-md rounded-lg
				transition duration-200
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
