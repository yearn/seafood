import React from 'react';

export default function Wordmark({onClick, className}: {onClick?: () => void, className?: string}) {
	return <h1 onClick={onClick} className={`
		font-wordmark rainbow-text drop-shadow ${className}`}>
		{'Seafood'}
	</h1>;
}
