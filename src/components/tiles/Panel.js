import React from 'react';

export default function Panel({title, onClick, className, innserClassName, children}) {
	return <div className={`
	p-0.5
	bg-none
	sm:dark:hover:bg-gradient-to-tl
  from-primary-500 to-pink-500
	cursor-pointer rounded-lg
	${className}`}>
		<div title={title} onClick={onClick} className={`
			w-full h-full p-4 flex
			bg-black rounded-lg
			${innserClassName}`}>
			{children}
		</div>
	</div>;
}