import React from 'react';
import {Link} from 'react-router-dom';

export default function LinkButton({to, className = '', children}) {
	return <Link to={to} className={`
		underline underline-offset-2
		hover:text-selected-400 dark:hover:text-selected-400
		${className}`}>{children}</Link>;
}