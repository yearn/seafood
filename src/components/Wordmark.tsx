import React from 'react';

export default function Wordmark({onClick, className}: {onClick?: () => void, className?: string}) {
	return <h1 onClick={onClick} className={`
		font-[Goldman] rainbow-text drop-shadow ${className}`}>
		{'Seafood'}
	</h1>;
}