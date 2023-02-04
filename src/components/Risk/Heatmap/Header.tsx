import React, {ReactNode} from 'react';
import {CgChevronDown, CgChevronUp} from 'react-icons/cg';

export default function Header({
	sortable,
	sort, 
	className,
	onClick,
	children
} : {
	sortable?: boolean,
	sort?: 'asc' | 'desc',
	className?: string, 
	onClick?: () => void,
	children: ReactNode
}) {
	return <div onClick={onClick} className={`
		px-3 py-2 rounded-lg
		relative flex items-center justify-center text-sm 2xl:text-base
		capitalize transition duration-200 active:transform
		${sort ? 'bg-secondary-200 dark:bg-primary-900/40' : ''}
		${sortable ? 'hover:bg-selected-300 dark:hover:bg-selected-600 cursor-pointer active:scale-95' : ''}
		${className}`}>
		{children}
		{sort && <div className={'absolute top-0 left-1 h-full flex items-center justify-center'}>
			{sort === 'desc' && <CgChevronDown />}
			{sort === 'asc' && <CgChevronUp />}
		</div>}
	</div>;
}
