import React from 'react';

export default function Chip({className, children}) {
	return <div className={`
		px-2 py-1 flex items-center
		text-xs text-secondary-50 capitalize 
		rounded-lg drop-shadow-sm
		${className}`}>
		{children}
	</div>;
}