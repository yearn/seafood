import React from 'react';

export default function Panel({title, onClick, className, children}) {
	return <div title={title} onClick={onClick} className={`
		sm:hover:bg-selected-300 sm:dark:hover:bg-selected-600
		active:transform active:scale-[98%]
		transition duration-200
		cursor-pointer
		${className}`}>
		{children}
	</div>;
}