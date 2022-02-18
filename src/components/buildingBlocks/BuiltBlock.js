import React from 'react';


function BuiltBlock({block, removeBlock}){
	

	return <div>
		<div>{block.content}</div>
		<button  onClick={() => removeBlock(block.index)}> {'Delete'}</button>
	</div>;
}



export default BuiltBlock;