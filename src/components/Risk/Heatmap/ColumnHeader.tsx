import React, {ReactNode} from 'react';
import {CgChevronDown, CgChevronUp} from 'react-icons/cg';

export default function ColumnHeader({
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
		min-w-[138px] sm:min-w-0 px-4 py-2
		relative flex items-center justify-center text-sm 2xl:text-base
		border border-transparent

		${sort ? `text-secondary-600 dark:text-secondary-200
			bg-secondary-300/40 dark:bg-primary-900/40
			border-[#d4d4d8] dark:border-primary-900` : ''}

		${sortable ? `cursor-pointer
			bg-neutral-200/40 dark:bg-neutral-800/40
			hover:bg-selected-300 hover:border-selected-300
			dark:hover:bg-selected-600 dark:hover:border-selected-600` : ''}

		${className}`}>
		<div className={'w-[-webkit-fill-available] truncate capitalize text-center'}>
			{children}
		</div>
		{sort && <div className={'absolute top-0 left-1 h-full flex items-center justify-center'}>
			{sort === 'desc' && <CgChevronDown />}
			{sort === 'asc' && <CgChevronUp />}
		</div>}
	</div>;
}
