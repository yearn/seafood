import React, {useState} from 'react';
import VaultButtons from '../VaultsList';
import ContractActions from '../ContractActions';
import {GetVaultContract} from  '../../ethereum/EthHelpers';
import StrategyButtons from '../StrategyList';



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
				details: vault,
				contract: contract
			});
			setStage(1);
		});

        
		
	}

	function addAction(fun){
		let blockt = block;
		blockt.function = fun.fun;
		blockt.block = fun.block;
		addBlock(blockt);
		reset();
	}

	function changeStage(stage){


		setStage(stage);
	}

	// function add(){
	// 	addBlock(block);
	// 	reset();
	// }


	function reset(){
		setBlock({});
		setStage(0);

	}

	
	//manual address or from list?
	return <div><span>{'Contract Type:'}</span>
		
		{stage == 0 && <VaultButtons provider={provider} clickFunction={addVault} />}
		{stage == 1 && <button  onClick={() => changeStage(2)}> {'See Strats?'}</button>}
		{stage == 1 && <button  onClick={() => changeStage(3)}> {'See Functions?'}</button>}
		{stage == 2 && <StrategyButtons provider={provider} vault={block.details} onSelect={addAction} />}
		{stage == 3 && <ContractActions block={block} onSelect={addAction} />}



		{stage != 0 && <button  onClick={() => reset()}> {'Reset'}</button>}

    
		
	</div>;
}



export default BuildingBlock;