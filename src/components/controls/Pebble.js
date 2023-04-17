import React from 'react';
export default function Pebble({className, title, onClick, children}) {
	return <button title={title} onClick={onClick} className={`
		w-[26px] h-[26px] p-0
		flex items-center justify-center 
		bg-transparent
		hover:bg-selected-400 hover:dark:bg-selected-600
		cursor-pointer
		${className}`}>
		{children}
	</button>;
}