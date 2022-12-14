import {useState} from 'react';
import {useScrollPosition} from '@n8tb1t/use-scroll-position';
import {useMediumBreakpoint} from '../utils/breakpoints';

export default function useScrollOverpass() {
	const mediumBreakpoint = useMediumBreakpoint();
	const [show, setShow] = useState(false);
	const [overpassClassName, setOverpassClassName] = useState('');
	const showClassName = 'bg-primary-800 dark:bg-black/60 backdrop-blur-md';
	const hideClassName = 'opacity-0 transition duration-200 pointer-events-none';

	useScrollPosition(({prevPos, currPos}) => {
		const yDelta = Math.abs(currPos.y - prevPos.y);
		if(!mediumBreakpoint) {
			if(currPos.y > -16) {
				setShow(true);
				setOverpassClassName('');
			} else if(currPos.y > -118) {
				setShow(true);
				setOverpassClassName(showClassName);
			} else if((currPos.y > prevPos.y) != show && yDelta <= 118) {
				setOverpassClassName(show ? hideClassName : showClassName);
				setShow(show => !show);
			} else if(yDelta > 118) {
				setShow(true);
				setOverpassClassName(showClassName);
			}

		} else {
			if(currPos.y > -64) {
				setShow(true);
				setOverpassClassName('');
			} else if(currPos.y > -118) {
				setShow(true);
				setOverpassClassName(`${showClassName}`);
			} else if((currPos.y > prevPos.y) != show && yDelta <= 118) {
				if(!show) setOverpassClassName(showClassName);
				setShow(show => !show);
			} else if(yDelta > 118) {
				setShow(true);
				setOverpassClassName(showClassName);
			}
		}

	}, [show]);

	return {
		overpassClassName,
		showClassName,
		hideClassName
	};
}