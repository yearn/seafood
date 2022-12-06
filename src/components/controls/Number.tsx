import React, {ReactNode} from 'react';

export default function Number({children}: {children: ReactNode}) {
	return <div className={'font-mono'}>{children}</div>;
}
