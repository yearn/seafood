import React from 'react';

export default function Input({_ref, type, defaultValue, placeholder, onChange, disabled, className, children}) {
	return <input ref={_ref}
		type={type}
		defaultValue={defaultValue}
		placeholder={placeholder}
		onChange={onChange} 
		disabled={disabled} 
		className={`
		text-secondary-900
		dark:text-secondary-200
		transition duration-200
		${className}`}>
		{children}
	</input>;
}