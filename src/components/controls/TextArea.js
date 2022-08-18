import React from 'react';

export default function TextArea({defaultValue, onChange, disabled, className, children}) {
	return <textarea defaultValue={defaultValue} onChange={onChange} disabled={disabled} className={`
		text-secondary-900
		dark:text-secondary-900
		transition duration-200
		${className}`}>
		{children}
	</textarea>;
}