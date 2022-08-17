import React from 'react';

export default function Select({options, value, onChange, disabled, className}) {
	return <select value={value} onChange={onChange} disabled={disabled} className={`
		h-10 pl-4 pr-12 border-0
		bg-primary-500 text-secondary-50 hover:bg-selected-400
		dark:bg-primary-900/40 dark:hover:bg-selected-600

		disabled:text-secondary-400 disabled:dark:text-secondary-500
		disabled:bg-gray-200 disabled:dark:bg-gray-800

		rounded-lg cursor-pointer
		transition duration-200
		${className}`}>

		{options && options.map(option => 
			<option key={option.key} value={option.key}>{option.value}</option>
		)}

	</select>;
}