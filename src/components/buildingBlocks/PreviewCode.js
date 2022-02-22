import React from 'react';


function PreviewCode({blocks}){


	let code_preview = () => {
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

		return script;

	};

	return <div><div  style={{whiteSpace: 'pre-wrap'}}>{code_preview()}</div></div>;
}



export default PreviewCode;