import React from 'react';

export default function Button({icon, label, title, onClick, ping, disabled, className, iconClassName}) {
	return <button onClick={onClick} disabled={disabled} title={title} className={`
		relative flex items-center justify-center
		h-10 px-4 border-2 border-transparent
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

		{ping && <div className={'absolute -top-1 -right-1 flex h-3 w-3'}>
			<div className={`
				absolute h-full w-full rounded-full 
				bg-selected-400 
				opacity-75 animate-ping`}></div>
			<div className={`
				relative rounded-full h-3 w-3 
				${disabled ? 'bg-primary-500' : 'bg-selected-500'}`}></div>
		</div>}

	</button>;
}