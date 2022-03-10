import React, {useEffect, useState} from 'react';
import ReactPrismEditor from 'react-prism-editor';
import {useApp} from '../../context/useApp';

function PreviewCode({blocks}){
	const {darkMode} = useApp();
	const [code, setCode] = useState('');

	useEffect(() => {
		let script = '\n@sign\ndef auto_generated_code():\n';
		let will_fail = false;

		for(let block of blocks){
			console.log(block);
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
			
			if (will_fail) script = script + '\n\t' + '#WILL FAIL';
			script = script + '\n\t' + name + ' = safe.contract("' + block.block.address + '")\n';
			script = script + '\t' + name + '.' + block.function.name + '('+ inputs +')\n';
			if(block.tenderlyURL){
				script = script + '\t#' + block.tenderlyURL;
			}
		}

		setCode(script);

	}, [blocks]);

	return <div className={'prism-editor-override'}>
		<ReactPrismEditor
			language={'js'}
			theme={darkMode ? 'funky' : 'solarizedlight'}
			lineNumber={true}
			code={code}
			readOnly={true}
			clipboard={true} />
	</div>;
}



export default PreviewCode;