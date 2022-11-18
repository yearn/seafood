import React from 'react';

export default function TextArea({
	defaultValue, 
	onChange, 
	disabled, 
	spellCheck=true, 
	className, 
	children
}) {
	return <textarea 
		defaultValue={defaultValue} 
		onChange={onChange} 
		disabled={disabled} 
		spellCheck={spellCheck}
		className={`
		text-secondary-900
		dark:text-secondary-200
		transition duration-200
		${className}`}>
		{children}
	</textarea>;
}