import React from 'react';
import useScrollOverpass from '../../context/useScrollOverpass';
import Tools from './Tools';

export default function Toolbar() {
	const {showClassName} = useScrollOverpass();
	return <div className={`
		fixed bottom-0 z-10
		w-full px-4 py-4
		flex flex-col items-center gap-4
		border-t border-white dark:border-secondary-900
		${showClassName}`}>
		<Tools />
	</div>;
}