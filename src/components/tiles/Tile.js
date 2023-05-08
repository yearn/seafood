import React from 'react';

export default function Tile({children}) {
	return <div className={`
		group rounded-lg
		hover:shadow-md dark:hover:shadow-[0_0_24px_-10px_rgba(203,213,225,0.16)]`}>
		{children}
	</div>;
}