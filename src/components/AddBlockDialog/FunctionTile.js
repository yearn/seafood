import React from 'react';

export default function FunctionTile({func, onClick}) {
	return <div className={'vault-tile'}>
		<div onClick={onClick} className={'main full'}>
			<div className={'info'}>
				<div className={'title'}>{func.name}</div>
				<div className={'chips'}>
					<div className={'chip bg-amber-300 dark:bg-amber-700'}>{'function'}</div>
					{func.inputs.map((input, index) => 
						<div key={index} className={'little-chip bg-amber-400 dark:bg-amber-800'}>{input.name}</div>)}
				</div>
			</div>
		</div>
	</div>;
}