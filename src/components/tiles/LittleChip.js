import React from 'react';

export default function LittleChip({label, className}) {
	return <div className={`
    h-fit px-2 py-[1px] text-xs
    text-secondary-50
    rounded-lg drop-shadow-sm
    ${className}`}>{label}</div>;
}