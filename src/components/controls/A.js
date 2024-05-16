import React from 'react';

export default function A({href, title = '', target = '', rel = '', className = '', children}) {
	return <a href={href} title={title} className={`
	underline underline-offset-2
	hover:text-selected-400
	active:text-selected-600
	${className}`}
	target={target} rel={rel}>
		{children}
	</a>;
}