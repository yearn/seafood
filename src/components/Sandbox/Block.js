import React from 'react';
import {BsTrash, BsCaretDownFill, BsCaretRightFill} from 'react-icons/bs';
import {BiggerThanSmallScreen, SmallScreen} from '../../utils/breakpoints';
import {truncateAddress} from '../../utils/utils';

export default function Block({block, onRemove, onShowEvents}) {
	const inputs_as_array = block.inputs ? Object.entries(block.inputs) : [];

	function formatValue(value, index) {
		if(block.function.inputs[index].type === 'address') {
			return truncateAddress(value);
		} else {
			return value;
		}
	}

	function borderColor() {
		if(block.success === undefined) return 'border-secondary-200/80 dark:border-secondary-800/80';
		if(block.success) return 'border-ok-600/80';
		return 'border-error-600/80';
	}

	function statusColor() {
		if(block.success) return 'text-ok-600/80 dark:text-ok-600/80';
		return 'text-error-600/80 dark:text-error-600/80';
	}

	function status() {
		if(block.success) return 'Succeeded';
		return '#Failed';
	}

	return <div className={'block-container'}>
		<div className={`block border-2 ${borderColor()}`}>
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

			<div className={'mt-4 flex items-center justify-between'}>
				<div className={'basis-1/3'}>
					{block.success !== undefined &&
						<a className={`${statusColor()}`} target={'_blank'} rel={'noreferrer'} href={block.tenderlyURL}>
							{status()}
						</a>
					}
				</div>
				<div className={'basis-1/3 flex justify-center'}>
					{block.success &&
						<a onClick={() => onShowEvents(block.index)} className={`${statusColor()} cursor-pointer`} target={'_blank'} rel={'noreferrer'}>
							{'Events'}
						</a>
					}
				</div>
				<div className={'basis-1/3 flex justify-end'}>
					<div className={'sm-circle-icon-button'} onClick={() => onRemove(block.index)}>
						<BsTrash></BsTrash>
					</div>
				</div>
			</div>
		</div>

		<div className={'caret'}>
			<SmallScreen>
				<BsCaretDownFill></BsCaretDownFill>
			</SmallScreen>
			<BiggerThanSmallScreen>
				<BsCaretRightFill></BsCaretRightFill>
			</BiggerThanSmallScreen>
		</div>
	</div>;
}