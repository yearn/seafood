import React, {ChangeEventHandler, MutableRefObject, ReactNode} from 'react';

export default function TextArea({
	_ref,
	defaultValue, 
	onChange, 
	disabled, 
	spellCheck=true, 
	className, 
	children
} : {
	_ref?: MutableRefObject<HTMLTextAreaElement> | undefined,
	defaultValue: string | number,
	onChange?: ChangeEventHandler<HTMLTextAreaElement> | undefined,
	disabled?: boolean,
	spellCheck?: boolean,
	className?: string,
	min?: number, 
	max?: number, 
	step?: number, 
	children?: ReactNode
}) {
	return <textarea 
		ref={_ref}
		defaultValue={defaultValue} 
		onChange={onChange} 
		disabled={disabled} 
		spellCheck={spellCheck}
		className={`
		text-secondary-900
		dark:text-secondary-200
		${className}`}>
		{children}
	</textarea>;
}