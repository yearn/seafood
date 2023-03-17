import React, {ReactNode, useState} from 'react';
import {CgChevronDown, CgChevronUp} from 'react-icons/cg';

export default function Accordian({
	title,
	expanded,
	disabled,
	className,
	children
}: {
	title: ReactNode,
	expanded?: boolean, 
	disabled?: boolean,
	className?: string,
	children: ReactNode
}) {
	const [expand, setExpand] = useState(expanded);
	return <div className={className}>
		<div onClick={() => setExpand(b => !b)} className={'flex items-center justify-between cursor-pointer'}>
			<div className={'w-72 sm:w-[36rem] 2xl:w-full'}>{title}</div>
			<div>
				{!disabled && expand && <CgChevronUp />}
				{!disabled && !expand && <CgChevronDown />}
			</div>
		</div>
		{expand && <div className={'pt-2'}>
			{children}
		</div>}
	</div>;
}
