import React from 'react';

export default function SmallIconButton({icon, onClick, className, iconClassName}) {
	return <div onClick={onClick} className={`
    w-6 h-6 
    flex items-center justify-center
    hover:bg-selected-200 
    dark:hover:bg-selected-600 
    active:transform active:scale-90
    rounded-full cursor-pointer
    transition duration-200
		${className}`}>
		{icon({className: iconClassName})}
	</div>;
}