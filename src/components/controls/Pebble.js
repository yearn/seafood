import React from 'react';
export default function Pebble({className = '', title, onClick, children}) {
	return <button title={title} onClick={onClick} className={`
		w-[26px] h-[26px] p-0
		flex items-center justify-center 
		bg-transparent
		sm:hover:text-black sm:active:text-black
		sm:hover:bg-selected-400 sm:active:bg-selected-500
		sm:dark:hover:bg-selected-600 sm:dark:active:bg-selected-700
		cursor-pointer
		${className}`}>
		{children}
	</button>;
}