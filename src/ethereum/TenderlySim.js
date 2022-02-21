import {ethers} from 'ethers';

async function setupTenderly(chainId){
	console.log(chainId);
	const fork_base_url = process.env.REACT_APP_FORK_BASE_URL;
	const payload = {network_id: chainId.toString()};
	let result = await fetch(fork_base_url, {
		method: 'POST',
		body: JSON.stringify(payload),
	});
	console.log(result);

	let data = await result.json();

	console.log(data);

	return new ethers.providers.JsonRpcProvider(
		'https://rpc.tenderly.co/fork/' + data['simulation_fork']['id']
	);

}

async function TenderlySim(blocks, tenderlyProvider){

	let returnList = [];

	for(let block of blocks){
		let gov = await block.contract.governance();
		let signer = tenderlyProvider.getSigner(gov);
		console.log('doing ', block.function.name);
		const blockWithSigner = block.block.contract.connect(signer);
		console.log(blockWithSigner);


		let func = blockWithSigner.functions[block.function.name + '()'];
		console.log(func);
		console.log(block.function);


		let x = await func({
			gasLimit: 8_000_000, gasPrice:0
		});


		let success = true;
		try{
			await x.wait();
        
		}catch(e){
			success = false;
		}

		let toReturn = {success: success, block: block};

		toReturn.tenderlyId = await tenderlyProvider.send('evm_getLatest', []);
		toReturn.tenderlyURL = 'https://dashboard.tenderly.co/yearn/yearn-web/fork/' + tenderlyProvider.connection.url.substring(29) +'/simulation/' + toReturn.tenderlyId;
		returnList.push(toReturn);
	}

	
	
	return returnList;

}

export {TenderlySim, setupTenderly};