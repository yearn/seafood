import React from 'react';
import {highlightString} from '../../utils/utils';
import Tile from './Tile';
import Panel from './Panel';
import Chip from './Chip';
import LittleChip from './LittleChip';

export default function FunctionTile({func, queryRe, onClick}) {
	return <Tile>
		<Panel onClick={onClick} className={'px-4 pt-4 pb-6 flex flex-col rounded-lg'}>
			<div className={'text-lg font-bold'}>{highlightString(func.name, queryRe)}</div>
			<div className={'w-full mt-3 flex flex-wrap items-center gap-2'}>
				<Chip label={'function'} className={'bg-amber-300 dark:bg-amber-700'} />
				{func.inputs.map((input, index) => 
					<LittleChip key={index} label={input.name} className={'bg-amber-400 dark:bg-amber-800'} />)}
			</div>
		</Panel>
	</Tile>;
}