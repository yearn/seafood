import React from 'react';

export default function Panel({title, onClick, className, children}) {
	return <div title={title} onClick={onClick} className={`
		bg-white dark:bg-secondary-900/80 
		sm:hover:bg-selected-300 sm:dark:hover:bg-selected-600
		cursor-pointer
		${className}`}>
		{children}
	</div>;
}