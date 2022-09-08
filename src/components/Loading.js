import React from 'react';

export default function Loading() {
	return <div className={`
		relative flex items-center justify-center h-3 w-3`}>
		<div className={`
			absolute h-full w-full rounded-full 
			bg-selected-400 
			opacity-75 animate-ping`} />
		<div className={`
			rounded-full h-2 w-2 bg-selected-500`} />
	</div>;
}