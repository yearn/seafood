import React from 'react';


function BuiltBlock({block, removeBlock}){

	let inputs_as_array = block.inputs ? Object.entries(block.inputs): [];
    
	console.log(inputs_as_array[0]);

	return <div>
		<div>{block.function.name + ' on ' + block.block.name } {block.name !== block.block.name && + block.name}  {'inputs: ' + inputs_as_array.map((x) =>{

			console.log(x);
			return x[0] + '=' + x[1]; 
		})}</div>
		<button  onClick={() => removeBlock(block.index)}> {'Delete'}</button>
	</div>;
}



export default BuiltBlock;