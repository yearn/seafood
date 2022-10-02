import React from 'react';

export default function Header({children}) {
	return <div className={`
    min-h-[52px] max-h-[52px] 
    sm:min-h-[58px] sm:max-h-[58px] 
    flex items-center justify-between
    border-b dark:border-b-black`}>
		{children}
	</div>;
}