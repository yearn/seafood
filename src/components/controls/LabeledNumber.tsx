import React from 'react';
import Number from './Number';

export default function LabaledNumber(
	{number, label, className}: {
		number: number | string,
		label: string,
		className: string
	}) {
	return <div className={`flex items-center gap-2 ${className}`}>
		<Number>{number}</Number>{label}
	</div>;
}