import React from 'react';
import {BsTrash} from 'react-icons/bs';
import {TruncateAddress} from '../../utils/utils';

export default function Blocks({block, onRemove}) {
	const inputs_as_array = block.inputs ? Object.entries(block.inputs) : [];

	function formatValue(value, index) {
		if(block.function.inputs[index].type === 'address') {
			return TruncateAddress(value);
		} else {
			return value;
		}
	}

	return <div className={'block'}>
		<h2>{block.function.name}</h2>

		<div>{block.name}</div>
		{block.name !== block.block.name && <>
			<div>{block.block.name}</div>
		</>}

		<ul>
			{inputs_as_array.map((input, index) => 
				<li key={index} className={'flex'}>
					<div className={'input-name'}>{`${input[0]}: `}</div>
					<div>{formatValue(input[1], index)}</div>
				</li>
			)}
		</ul>

		<div className={'flex justify-end'}>
			<div className={'mt-2 sm-circle-icon-button'} onClick={() => onRemove(block.index)}>
				<BsTrash></BsTrash>
			</div>
		</div>

	</div>;
}