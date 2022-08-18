import React, {useEffect, useState} from 'react';
import {TbCopy, TbCheck} from 'react-icons/tb';
import {BiggerThanSmallScreen, SmallScreen} from '../../utils/breakpoints';
import {Button} from '../controls';
import {useBlocks} from './useBlocks';

export default function Code() {
	const {blocks} = useBlocks();
	const [linesOfCode, setLinesOfCode] = useState([]);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		const lines = [];
		lines.push('@sign');
		lines.push('def auto_generated_code():');
		let will_fail = false;

		for(let block of blocks){
			let inputs = block.function.inputs.map(x =>{
				if(block.inputs[x.name]){
					let ins = block.inputs[x.name];
					if(x.type === 'address' | x.type === 'string'){
						ins = '"' + ins + '"';
					}
					return ins; 
				}
				will_fail = true;
			});

			let name = block.block.name.replace(/[^a-zA-Z]/g, '_').toLowerCase();
			
			if (will_fail) lines.push('\t#WILL FAIL');
			lines.push(`\t${name} = safe.contract("${block.block.address}")`);
			lines.push(`\t${name}.${block.function.name}(${inputs})`);
			if(block.tenderlyURL) lines.push(`\t#${block.tenderlyURL})`);
		}

		setLinesOfCode(lines);
	}, [blocks]);

	function onCopyCode() {
		try {
			navigator.clipboard.writeText(linesOfCode.join('\n'));
		} finally {
			setCopied(true);
			setTimeout(() => {
				setCopied(false);
			}, 2500);
		}
	}

	return <div className={'pt-8 pb-32 overflow-x-auto grow'}>
		{linesOfCode.map((line, index) => 
			<div key={index} className={'flex items-center'}>
				<div className={'ml-2 mr-4 w-8 min-w-[2rem] text-right dark:text-secondary-400/60'}>{''}{index + 1}</div>
				<div className={'whitespace-nowrap'}>
					{Array.from(line).filter(c => c === '\t').map((_, index) => <span key={index}>&emsp;</span>)}
					{line.replace('\t', '')}
				</div>
			</div>
		)}

		<SmallScreen>
			<div className={`
				fixed bottom-0 left-0 w-full 
				px-8 py-4 flex items-center justify-center
				backdrop-blur-md`}>
				<Button icon={copied ? TbCheck : TbCopy} onClick={onCopyCode} />
			</div>
		</SmallScreen>
		<BiggerThanSmallScreen>
			<Button icon={copied ? TbCheck : TbCopy} onClick={onCopyCode} className={'absolute top-36 right-14'} />
		</BiggerThanSmallScreen>
	</div>;
}