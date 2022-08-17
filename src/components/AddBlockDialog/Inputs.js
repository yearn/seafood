import React from 'react';

export default function Inputs({children}) {
	return <div className={'grow pb-4 flex flex-col items-center justify-center gap-8'}>
		{children}
	</div>;
}