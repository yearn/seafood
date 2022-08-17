import React from 'react';

export default function Chip({label, className}) {
	return <div className={`
    px-2 py-1 text-xs capitalize
    text-secondary-50
    rounded-lg drop-shadow-sm
    ${className}`}>{label}</div>;
}