import React, {useEffect, useState} from 'react';
import {BsClipboard} from 'react-icons/bs';
import {useBlocks} from './useBlocks';

export default function Code() {
	const {blocks} = useBlocks();
	const [linesOfCode, setLinesOfCode] = useState([]);

	useEffect(() => {
		const lines = [];
		lines.push('@sign\ndef auto_generated_code():');
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

	return <div className={'pb-32 overflow-x-auto grow'}>
		{linesOfCode.map((line, index) => 
			<div key={index} className={'flex items-center'}>
				<div className={'pl-2 pr-4 dark:text-secondary-400/60'}>{index + 1}</div>
				<div className={'whitespace-nowrap'}>{line}</div>
			</div>
		)}

		<div className={'actions'}>
			<button><BsClipboard className={'text-4xl'}></BsClipboard></button>
		</div>
	</div>;
}