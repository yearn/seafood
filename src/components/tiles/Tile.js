import React from 'react';

export default function Tile({children}) {
	return <div className={'p-1 group rounded-lg'}>
		{children}
	</div>;
}