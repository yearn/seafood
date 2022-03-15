import {useMediaQuery} from 'react-responsive';

export function useMediumBreakpoint() {
	return useMediaQuery({minWidth: 768});
}

export function SmallScreen({children}) {
	const mediumBreakpoint = useMediumBreakpoint();
	return !mediumBreakpoint ? children : null;
}

export function BiggerThanSmallScreen({children}) {
	const mediumBreakpoint = useMediumBreakpoint();
	return mediumBreakpoint ? children : null;
}