import React, {useState} from 'react';
import VaultButtons from '../VaultsList';
import ContractActions from '../ContractActions';
import {GetVaultContract} from  '../../ethereum/EthHelpers';
import StrategyButtons from '../StrategyList';
import BuildManual from './BuildManual';



function BuildingBlock({provider, addBlock}){
	console.log(provider);
	const [stage, setStage] = useState(0);
	const [block, setBlock] = useState({});
    
	function addVault(vault){
		console.log('addVault = ');
		console.log(vault);


		GetVaultContract(vault.address, provider).then(contract => {
			setBlock({
				type: 'Vault',
				address: vault.address,
				name: vault.name,
				details: vault,
				contract: contract
			});
			setStage(11);
		});

        
		
	}

	function addAction(fun){
		let blockt = block;
		blockt.function = fun.fun;
		blockt.block = fun.block;
		blockt.inputs = fun.inputs;
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
		{stage == 0 && <button  onClick={() => changeStage(20)}> {'Manual Setup?'}</button>}
		{stage == 0 && <button  onClick={() => changeStage(10)}> {'See Vaults'}</button>}
		
        
        
		{stage == 10 && <VaultButtons provider={provider} clickFunction={addVault} />}
		{stage == 11 && <button  onClick={() => changeStage(12)}> {'See Strats?'}</button>}
		{stage == 11 && <button  onClick={() => changeStage(13)}> {'See Functions?'}</button>}
		{stage == 12 && <StrategyButtons provider={provider} vault={block.details} onSelect={addAction} />}
		{stage == 13 && <ContractActions block={block} onSelect={addAction} />}

		{stage == 20 && <BuildManual provider={provider} clickFunction={addAction} />}

		{stage != 0 && <button  onClick={() => reset()}> {'Reset'}</button>}

    
		
	</div>;
}



export default BuildingBlock;