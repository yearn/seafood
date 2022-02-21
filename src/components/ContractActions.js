
import React, {useState} from 'react';


function ContractActions({block, onSelect}) {
	let contract = block.contract;
	const [values, setValues] = useState({});
	const [nonce, setNonce] = useState(0);

	function clickFunction(extended){
		event.preventDefault();
		console.log(values);
		let toUp = extended;
		toUp.inputs = values[extended.fun.name + extended.fun.inputs.map(x => x.name)];
		console.log(toUp);
		onSelect(toUp);
	}

	const handleChange = (fieldId, name, value) => {
		console.log(value);
		setValues(currentValues => {
			if(! currentValues[fieldId] )currentValues[fieldId] = {};
			currentValues[fieldId][name] = value;
			return currentValues;
		});
		setNonce(nonce+1); //need to force update because react is stupid
	};


	let fragments = contract.interface.fragments.map(fun =>{
		if(fun.type !== 'function') return;

		if(fun.stateMutability === 'pure' || fun.stateMutability === 'view') return;


		let key = fun.name + fun.inputs.map(x => x.name);
		let extended = {
			fun: fun,
			block: block
		};
		return(
			<form key={key} onSubmit={() => clickFunction(extended)} >

				{fun.inputs.map(input =>{
					return <textarea key={input.name} value={values[fun.inputs] ? (values[fun.inputs][input.name] && values[fun.inputs][input.name]): input.name + '(' + input.type + ')'} onChange={event => handleChange(fun.inputs, input.name, event.target.value)} />;
				})}
				
				
				<button > {fun.name}</button>

			</form>);
	});

	
	
	

	return fragments;

}

export default ContractActions;