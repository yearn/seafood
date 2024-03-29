import React from 'react';

export default function List({children}) {
	return <div className={`
    overflow-y-auto pt-4 pb-24 grid grid-flow-row gap-2 grid-cols-1 
    sm:gap-8 md:grid-cols-3 2xl:grid-cols-4`}>
		{children}
	</div>;
}