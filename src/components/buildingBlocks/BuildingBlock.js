import React from 'react';


function BuildingBlock({provider, addBlock}){
	console.log(provider);
	

	function add(){
		addBlock(
			{
				type: 'Vault',
				content: 'Bla'
			}
		);
	}

	return <div>

		<button  onClick={() => add()}> {'Add'}</button>
	</div>;
}



export default BuildingBlock;