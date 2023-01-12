import React from 'react';
import Spinner from './Spinner';

export default function Button({
	icon = null, 
	label, 
	title = null, 
	onClick, 
	notify = false, 
	ping = false, 
	disabled = false, 
	className = '', 
	iconClassName = '',
	busy = false}) {

	return <button onClick={onClick} disabled={disabled} title={title} className={`
		relative flex items-center justify-center
		h-10 px-4 border-2 border-transparent
		bg-primary-500 text-secondary-50 sm:hover:bg-selected-400
		dark:bg-primary-900/40 sm:dark:hover:bg-selected-600
		active:transform active:scale-95

		disabled:text-secondary-400 disabled:dark:text-secondary-500
		disabled:bg-gray-200 disabled:dark:bg-gray-900/80
		sm:disabled:hover:bg-gray-200 sm:disabled:dark:hover:bg-gray-900/80
		disabled:active:scale-100
		disabled:cursor-default

		rounded-lg cursor-pointer
		transition duration-200
		${icon && label ? 'pl-3' : ''}
		${!label ? 'px-3' : ''}
		${className}`}>

		{!busy && icon && <>
			{'\u00A0'}
			{icon({className: `text-xl
			${disabled 
		? 'stroke-gray-400 dark:stroke-gray-600 pointer-events-none' 
		: 'stroke-secondary-50 dark:stroke-secondary-300'}
			${label ? 'mr-2' : ''}
			${iconClassName}`})}
			{'\u00A0'}
		</>}

		{!busy && label}

		{busy && <Spinner 
			width={'1.5rem'}
			height={'1.5rem'} />}

		{notify && <div className={'absolute -top-1 -right-1 flex h-3 w-3'}>
			<div className={`
				relative rounded-full h-3 w-3 shadow
				${disabled ? 'bg-primary-500' : 'bg-attention-400 dark:bg-attention-500'}`}></div>
		</div>}

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