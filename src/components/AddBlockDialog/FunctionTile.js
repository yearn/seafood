import React from 'react';
import {highlightString} from '../../utils/utils';

export default function FunctionTile({func, queryRe, onClick}) {
	return <div className={'vault-tile'}>
		<div onClick={onClick} className={'main full'}>
			<div className={'title'}>{highlightString(func.name, queryRe)}</div>
			<div className={'info'}>
				<div className={'chips flex-wrap'}>
					<div className={'chip bg-amber-300 dark:bg-amber-700'}>{'function'}</div>
					{func.inputs.map((input, index) => 
						<div key={index} className={'little-chip bg-amber-400 dark:bg-amber-800'}>{input.name}</div>)}
				</div>
			</div>
		</div>
	</div>;
}