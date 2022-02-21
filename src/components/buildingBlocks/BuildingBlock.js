import React, {useState} from 'react';
import VaultButtons from '../VaultsList';
import ContractActions from '../ContractActions';
import {GetVaultContract} from  '../../ethereum/EthHelpers';



function BuildingBlock({provider, addBlock}){
	console.log(provider);
	const [stage, setStage] = useState(0);
	const [block, setBlock] = useState({});
    
	function addVault(vault){
		console.log(vault);


		GetVaultContract(vault, provider).then(contract => {
			setBlock({
				type: 'Vault',
				address: vault.address,
				name: vault.name,
				contract: contract
			});
			setStage(1);
		});

        
		
	}

	function addAction(fun){
		let blockt = block;
		blockt.function = fun;
		addBlock(blockt);
		reset();
	}

	// function add(){
	// 	addBlock(block);
	// 	reset();
	// }


	function reset(){
		setBlock({});
		setStage(0);

	}

	return <div><span>{'Contract Type:'}</span>
		
		{stage == 0 && <VaultButtons provider={provider} clickFunction={addVault} />}
		{stage == 1 && <ContractActions contract={block.contract} onSelect={addAction} />}


		{stage != 0 && <button  onClick={() => reset()}> {'Reset'}</button>}

    
		
	</div>;
}



export default BuildingBlock;