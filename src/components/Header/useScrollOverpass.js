import {useState} from 'react';
import {useScrollPosition} from '@n8tb1t/use-scroll-position';
import {useMediumBreakpoint} from '../../utils/breakpoints';

export default function useScrollOverpass() {
	const mediumBreakpoint = useMediumBreakpoint();
	const [show, setShow] = useState(false);
	const [overpassClass, setOverpassClass] = useState('');

	useScrollPosition(({prevPos, currPos}) => {
		if(currPos.y > -16) {
			setShow(true);
			setOverpassClass('');
		}else if(currPos.y > -118) {
			setShow(true);
			setOverpassClass('scroll-overpass');
		}else if((currPos.y > prevPos.y) != show) {
			setShow(show => {return !show;});
			if(show && !mediumBreakpoint) setOverpassClass('scroll-overpass-hide');
			if(!show) setOverpassClass('scroll-overpass');
		}
	}, [show]);

	return {overpassClass};
}