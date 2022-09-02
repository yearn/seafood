import {ethers} from 'ethers';
import config from '../config';
import {GetStrategyContract, GetVaultContract} from './EthHelpers';

async function setupTenderly(chainId){
	const payload = {network_id: chainId};
	const result = await fetch(config.tenderly.forkUrl, {
		method: 'POST',
		body: JSON.stringify(payload),
	});

	const data = await result.json();
	return new ethers.providers.JsonRpcProvider(
		`https://rpc.tenderly.co/fork/${data['simulation_fork']['id']}`
	);
}

async function TenderlySim(blocks, tenderlyProvider){
	console.log(blocks);

	let returnList = [];

	for(let i =0; i < blocks.length; i++){
		
		let block = blocks[i];

		block.contract = await GetVaultContract(block.address, tenderlyProvider);
		let gov = await block.contract.governance();
		let signer = tenderlyProvider.getSigner(gov);

		const blockWithSigner = block.block.type === 'strategy'
			? GetStrategyContract(block.block.address, tenderlyProvider).connect(signer)
			: block.contract.connect(signer);

		console.log(blocks);

		// console.log(block.function.name + '(' + block.function.inputs.map(x => x.type) + ')');
		let func = blockWithSigner.functions[block.function.name + '(' + block.function.inputs.map(x => x.type) + ')'];
		//console.log(func);
		// console.log(block.function);
		let pass = true;
		let inputs = block.function.inputs.map(x =>{
			// console.log(x);
			// console.log(block.inputs);
			if(block.inputs[x.name]){
				let ins = block.inputs[x.name];
				// console.log('pass', x.name);
				
				return ins; 
			}
			console.log('FAIL');
			pass = false;
		});
		if(!pass) continue;
		if(String(inputs) === 'false'){
			inputs = [false];
		} else if (String(inputs) === 'true'){
			inputs = [true];
		}

		let x = await func(...inputs, {
			gasLimit: 8_000_000, gasPrice:0
		});

		// console.log(x);


		let success = true;
		let result = null;
		try{
			result = await x.wait();
			console.log(result);
        
		}catch(e){
			success = false;
		}

		let toReturn = block;
		toReturn.success = success;
		toReturn.result = result;

		toReturn.tenderlyId = await tenderlyProvider.send('evm_getLatest', []);
		toReturn.tenderlyURL = 'https://dashboard.tenderly.co/yearn/yearn-web/fork/' + tenderlyProvider.connection.url.substring(29) +'/simulation/' + toReturn.tenderlyId;
		returnList.push(toReturn);
	}

	console.log(returnList);
	
	return returnList;

}

export {TenderlySim, setupTenderly};