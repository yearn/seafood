import React from 'react';

export default function FunctionTile({func, onClick}) {
	return <div className={'vault-tile'}>
		<div onClick={onClick} className={'title-button'}>
			<div className={'title-sm'}>{func.name}</div>
			<div className={'chip bg-amber-700'}>{'function'}</div>
		</div>
		<div className={'flex items-center justify-between'}>
			<div className={'flex items-center address'}>
				<div className={'min-h-[40px] pl-2 text-xs'}>{`(${func.inputs.map(i => i.name).join(', ')})`}</div>
			</div>
		</div>
	</div>;
}