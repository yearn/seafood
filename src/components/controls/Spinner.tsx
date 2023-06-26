import React from 'react';

export default function Spinner({size, bloom}: {size: number, bloom: number}) {
	return <div className={`
		flex items-center justify-center`}>
		<div className={`
			absolute h-${bloom} w-${bloom}
			opacity-75 animate-ping
			bg-selected-500`} />
		<div className={`h-${size} w-${size} bg-selected-500`} />
	</div>;
}
