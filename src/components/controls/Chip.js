import React from 'react';

export default function Chip({label, icon, onClick, hot = true}) {
	return <div onClick={onClick} className={`
		flex items-center

		${icon 
		? 'aspect-square px-[.475rem] py-0'
		: 'px-4 py-1'}

		${hot 
		? `text-secondary-50 bg-selected-400 hover:bg-selected-300
			dark:bg-selected-600 hover:dark:bg-selected-500`

		: `text-secondary-600 bg-secondary-200 hover:bg-selected-300 
			dark:text-secondary-200 dark:bg-primary-900/40 dark:hover:bg-selected-600`}

		text-sm capitalize rounded-lg
		active:transform active:scale-95
		transition duration-200
		${onClick ? 'cursor-pointer' : ''}`}>
		{label || icon({className: hot 
			? 'fill-attention-200 dark:fill-attention-400 glow-attention-md' 
			: 'fill-secondary-400 dark:fill-secondary-200/80'})}
	</div>;
}