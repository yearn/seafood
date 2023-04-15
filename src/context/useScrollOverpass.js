import {useEffect, useState} from 'react';

export default function useScrollOverpass() {
	const showClassName = 'bg-secondary-100/60 dark:bg-black/60 backdrop-blur-md shadow';
	const hideClassName = 'bg-secondary-100/60 dark:bg-black/60 backdrop-blur-md';
	const [overpassClassName, setOverpassClassName] = useState(hideClassName);

	useEffect(() => {
		function updatePosition() {
			setOverpassClassName(window.scrollY > 0 ? showClassName : hideClassName);
		}

		window.addEventListener('scroll', updatePosition);
		updatePosition();

		return () => window.removeEventListener('scroll', updatePosition);
	}, [setOverpassClassName]);

	return {
		overpassClassName, 
		showClassName, 
		hideClassName
	};
}