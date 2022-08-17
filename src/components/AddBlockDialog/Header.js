import React from 'react';

export default function Header({children}) {
	return <div className={`
    min-h-[42px] max-h-[42px] 
    sm:min-h-[58px] sm:max-h-[58px] 
    flex items-center justify-between`}>
		{children}
	</div>;
}