import React, {ChangeEventHandler, MutableRefObject, ReactNode} from 'react';

export default function Input({
	_ref, 
	type, 
	defaultValue, 
	placeholder, 
	onChange, 
	disabled, 
	className, 
	min,
	max, 
	step, 
	children
}: {
	_ref?: MutableRefObject<HTMLInputElement> | undefined,
	type: string,
	defaultValue: string | number,
	placeholder?: string,
	onChange?: ChangeEventHandler<HTMLInputElement> | undefined,
	disabled?: boolean,
	className?: string,
	min?: number, 
	max?: number, 
	step?: number, 
	children?: ReactNode
}) {
	return <input ref={_ref}
		type={type}
		defaultValue={defaultValue}
		placeholder={placeholder}
		onChange={onChange} 
		disabled={disabled}
		min={min}
		max={max}
		step={step}
		className={`
		text-secondary-900
		dark:text-secondary-200
		transition duration-200
		${className}`}>
		{children}
	</input>;
}