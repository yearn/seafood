import React from 'react';

export default function SmallIconButton({icon, onClick, className, iconClassName=''}) {
	return <div onClick={onClick} className={`
    w-6 h-6 
    flex items-center justify-center
    hover:bg-selected-200 
    dark:hover:bg-selected-600 
    rounded-full cursor-pointer
		${className}`}>
		{icon({className: iconClassName})}
	</div>;
}