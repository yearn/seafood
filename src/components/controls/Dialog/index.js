import React from 'react';
import Close from './Close';

export default function Dialog({show, className, children}) {
	return <div className={`
		fixed z-[100] inset-0
		flex items-center justify-center
		bg-secondary-50 dark:bg-secondary-900
		${className}
		${!show ? 'invisible' : ''}`}>
		<div className={`
			relative w-full h-full p-2
			flex flex-col justify-end
			sm:px-8 sm:py-4`}>
			<Close />
			<div className={'h-full flex flex-col'}>
				{children}
			</div>
		</div>
	</div>;
}