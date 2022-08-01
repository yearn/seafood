import React from 'react';

export default function Bone({invisible}) {
	return <div className={`relative ${invisible ? 'invisible': 'animate-pulse'}`}>
		&nbsp;
		<div className={'absolute inset-1 rounded bg-secondary-600/40'}></div>
	</div>;
}