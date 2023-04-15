import React from 'react';

export default function Chip({label, icon = undefined, onClick, hot = true, tall = false, className = ''}) {
	return <div onClick={onClick} className={`
		flex items-center
		${tall ? 'h-10' : 'h-8'}

		${icon 
		? 'aspect-square flex items-center justify-center'
		: 'px-4'}

		${hot 
		? `text-selected-800 dark:text-secondary-50
			border border-selected-600 dark:border-selected-600
			bg-selected-400/40 hover:bg-selected-300
			dark:bg-selected-600/40 dark:hover:bg-selected-500`

		: `text-secondary-600 dark:text-secondary-200
			border border-transparent
			bg-secondary-200 sm:hover:bg-selected-300 
			dark:bg-primary-900/40 sm:dark:hover:bg-selected-600`}

		text-sm capitalize
		${onClick ? 'cursor-pointer' : ''}
		${className}`}>
		{label || icon({className: hot 
			? 'fill-attention-200 dark:fill-attention-400 glow-attention-md' 
			: 'fill-secondary-400 dark:fill-secondary-200/80'})}
	</div>;
}