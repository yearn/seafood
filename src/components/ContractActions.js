
import React from 'react';


function ContractActions({contract, onSelect}) {
	
	console.log(contract);
	console.log(contract.interface.functions);

	function clickFunction(fun){
		onSelect(fun);
	}


	let fragments = contract.interface.fragments.map(fun =>{
		if(fun.type !== 'function') return;

		if(fun.stateMutability === 'pure' || fun.stateMutability === 'view') return;
		if(fun.inputs.length >0) return;

		let key = fun.name + fun.inputs.map(x => x.name);
		return(<div key={key}>
			<button  onClick={() => clickFunction(fun)}> {fun.name}</button>
		
		</div>);
	});

	
	
	

	return fragments;

}

export default ContractActions;