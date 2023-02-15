import React, {ReactNode} from 'react';

export default function Notification({className, children}: {className?: string, children: ReactNode}) {
	return <div className={`
	fixed z-50 top-0 w-full h-32 sm:h-14 px-4 sm:px-0
	flex flex-col sm:flex-row items-center justify-center gap-4
	text-lg bg-secondary-900 bg-stripes bg-stripes-black
	${className}`}>
		{children}
	</div>;
}
