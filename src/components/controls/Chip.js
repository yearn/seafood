import React from 'react';

export default function Chip({label, icon = undefined, onClick, hot = true, tall = false, className = ''}) {
	return <div onClick={onClick} className={`
		flex items-center border
		${tall ? 'h-10' : 'h-8'}

		${icon 
		? 'aspect-square flex items-center justify-center'
		: 'px-4'}

		text-selected-800 dark:text-secondary-50 sm:dark:hover:text-black
		sm:hover:bg-selected-300 sm:dark:hover:bg-selected-600
		sm:active:bg-selected-400 sm:dark:active:bg-selected-700

		${hot 
		? 'border-selected-400 hover:border-selected-300 dark:border-selected-600 bg-selected-400/40 dark:bg-selected-600/40'
		: 'border-transparent bg-secondary-200 dark:bg-primary-900/40'}

		text-sm capitalize
		${onClick ? 'cursor-pointer' : ''}
		${className}`}>
		{label || icon({className: hot 
			? 'fill-attention-200 dark:fill-attention-400 glow-attention-md' 
			: 'fill-secondary-400 dark:fill-secondary-200/80'})}
	</div>;
}