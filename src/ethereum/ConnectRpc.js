import React, {useState} from 'react';
const {ethers} = require('ethers');

function ConnectR() {
	const [isLoading, setIsLoading] = useState(true);
	const [loaded, setLoaded] = useState();
	console.log('hello');
	/*const provider = new ethers.providers.JsonRpcProvider(
    "https://erigon:iAlBsaOWZtIrYNMR4a4J@node.yearn.network"
    //"https://opera:zgNmpZno8CFXCVvHm7I2JZ6NETmEotAA@fantom.yearn.science"
  );*/
	const provider = new ethers.providers.WebSocketProvider('wss://erigon:iAlBsaOWZtIrYNMR4a4J@node.yearn.network');
	console.log('hell3o');
	console.log(provider);

	provider
		.getBlockNumber()
		.then((response) => {
			console.log(response);
			return response;
      
		})
		.then((data) => {
			setIsLoading(false);
			setLoaded(data);
			console.log(data);
		});

	if (isLoading) {
		return 'loading';
	}
	console.log('hell4o');
	return <div>{loaded}</div>;
}

export default ConnectR;
