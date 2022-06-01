
import React, {useState} from 'react';


function ContractActions({block, onSelect}) {
	let contract = block.contract;
	const [values, setValues] = useState({});
	const [nonce, setNonce] = useState(0);
	console.log(block);
	function clickFunction(e, extended){
		let key = extended.fun.name + extended.fun.inputs.map(x => x.name).join('');
		e.preventDefault();
		let toUp = extended;
		toUp.inputs = values[key];
		
		onSelect(toUp);
	}

	const handleChange = (fieldId, name, value) => {
		// console.log(value);
		setValues(currentValues => {
			if(! currentValues[fieldId] )currentValues[fieldId] = {};
			currentValues[fieldId][name] = value;
			return currentValues;
		});
		setNonce(nonce+1); //need to force update because react is stupid
	};//facu is great


	let fragments = contract.interface.fragments.map(fun =>{
		if(fun.type !== 'function') return;

		if(fun.stateMutability === 'pure' || fun.stateMutability === 'view') return;


		let key = fun.name + fun.inputs.map(x => x.name).join('');
		let extended = {
			fun: fun,
			block: block
		};
		return(
			
			<form key={key} onSubmit={(e) => clickFunction(e, extended)} >

				{fun.inputs.map(input =>{
					return <textarea key={input.name} value={values[key] ? (values[key][input.name] && values[key][input.name]): input.name + '(' + input.type + ')'} onChange={event => handleChange(key, input.name, event.target.value)} />;
				})}
				
				
				<button > {fun.name}</button>

			</form>);
	});

	
	
	

	return <div>
		<h4>{block.name + ' at ' + block.address}</h4>
		{fragments}

	</div>;

}

export default ContractActions;