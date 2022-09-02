import React from 'react';

export default function Wordmark({onClick, className}) {
	return <h1 onClick={onClick} className={`
		font-[Goldman] rainbow-text drop-shadow ${className}`}>
		{'Seafood'}
	</h1>;
}