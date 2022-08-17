import {useState} from 'react';
import {useScrollPosition} from '@n8tb1t/use-scroll-position';
import {useMediumBreakpoint} from '../utils/breakpoints';

export default function useScrollOverpass() {
	const mediumBreakpoint = useMediumBreakpoint();
	const [show, setShow] = useState(false);
	const [overpassClassName, setOverpassClassName] = useState('');
	const showClassName = 'bg-secondary-100/60 dark:bg-secondary-900/60 backdrop-blur-md shadow-md';
	const hideClassName = 'bg-transparent dark:bg-transparent backdrop-blur-none shadow-none';

	useScrollPosition(({prevPos, currPos}) => {
		if(currPos.y > -16) {
			setShow(true);
			setOverpassClassName('');
		}else if(currPos.y > -118) {
			setShow(true);
			setOverpassClassName(showClassName);
		}else if((currPos.y > prevPos.y) != show) {
			setShow(show => {return !show;});
			if(show && !mediumBreakpoint) setOverpassClassName(hideClassName);
			if(!show) setOverpassClassName(showClassName);
		}
	}, [show]);

	return {overpassClassName, showClassName, hideClassName};
}