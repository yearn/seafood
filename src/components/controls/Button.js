import React from 'react';

export default function Button({icon, label, title, onClick, flash, disabled, className, iconClassName}) {
	return <button onClick={onClick} disabled={disabled} title={title} className={`
		flex items-center justify-center
		h-10 px-4 border-2 
		${flash ? 'border-primary-400 animate-pulse' : 'border-transparent'}
		bg-primary-500 text-secondary-50 hover:bg-selected-400
		dark:bg-primary-900/40 dark:hover:bg-selected-600
		active:transform active:scale-95

		disabled:text-secondary-400 disabled:dark:text-secondary-500
		disabled:bg-gray-200 disabled:dark:bg-gray-800
		disabled:active:scale-100
		disabled:cursor-default

		rounded-lg cursor-pointer
		transition duration-200
		${icon && label ? 'pl-3' : ''}
		${!label ? 'px-3' : ''}
		${className}`}>

		{icon && <>
			{'\u00A0'}
			{icon({className: `text-xl stroke-secondary-50 dark:stroke-secondary-300
			disabled:stroke-gray-500 disabled:dark:stroke-gray-400 disabled:pointer-events-none
			${label ? 'mr-2' : ''}
			${iconClassName}`})}
			{'\u00A0'}
		</>}

		{label}

	</button>;
}