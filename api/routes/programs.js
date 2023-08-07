const axios = require('axios');
const ethers = require('ethers');
const {Multicall} = require('ethereum-multicall');
const express = require('express');
const fetchAbi = require('./abi/fetchAbi');

const router = express.Router();

const programs = {
	ycrv: {
		address: '0xFCc5c47bE19d06BF83eB04298b026F81069ff65b',
		name: 'yCRV'
	}, veyfi: {
		address: '0x90c1f9220d90d3966FbeE24045EDd73E1d588aD5',
		name: 'veYFI'
	}, yeth: {
		address: '0x1BED97CBC3c24A4fb5C069C6E311a967386131f7',
		name: 'yETH'
	}, yfi: {
		address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
		name: 'YFI'
	}, weth: {
    name: 'WETH',
    address: '0xa258C4606Ca8206D8aA700cE2143D7db854D168c'
  }
};

function fetchPriceUrl(chainId, tokenAddress) {
  return `${process.env['YDAEMON']}/${chainId}/prices/${tokenAddress}?humanized=true`;
}

async function fetchProgramVaults() {
  const provider = new ethers.providers.JsonRpcProvider(process.env[`RPC_URI_FOR_${1}`]);
  const multicall = new Multicall({ethersProvider: provider, tryAggregate: true});

	const ycrvMultiCall = {
		reference: programs.ycrv.address,
		contractAddress: programs.ycrv.address,
		abi: await fetchAbi(1, programs.ycrv.address),
		calls: [
			{reference: 'decimals', methodName: 'decimals', methodParameters: []},
			{reference: 'totalSupply', methodName: 'totalSupply', methodParameters: []}
		]
	};

	const veyfiMultiCall = {
		reference: programs.yfi.address,
		contractAddress: programs.yfi.address,
		abi: await fetchAbi(1, programs.yfi.address),
		calls: [
			{reference: 'decimals', methodName: 'decimals', methodParameters: []},
			{reference: 'balanceOf', methodName: 'balanceOf', methodParameters: [programs.veyfi.address]}
		]
	};

	const yethMultiCall = {
		reference: programs.yeth.address,
		contractAddress: programs.yeth.address,
		abi: await fetchAbi(1, programs.yeth.address),
		calls: [
			{reference: 'decimals', methodName: 'decimals', methodParameters: []},
			{reference: 'totalSupply', methodName: 'totalSupply', methodParameters: []}
		]
	};

	const multicallResults = (await multicall.call([
    ycrvMultiCall, 
    veyfiMultiCall, 
    yethMultiCall
  ])).results;

  const prices = (await Promise.all([
    axios.get(fetchPriceUrl(1, programs.ycrv.address)),
    axios.get(fetchPriceUrl(1, programs.yfi.address)),
    axios.get(fetchPriceUrl(1, programs.weth.address))
  ])).map(result => parseFloat(result.data));

  const results = [];

  {
    const decimals = multicallResults[programs.ycrv.address].callsReturnContext[0].returnValues[0];
    const totalSupply = BigInt(multicallResults[programs.ycrv.address].callsReturnContext[1].returnValues[0].hex);
    const tvl = Number(totalSupply / (10n ** BigInt(decimals))) * prices[0];
    results.push({
      address: programs.ycrv.address,
      name: programs.ycrv.name, 
      tvl
    });
  }

  {
    const decimals = multicallResults[programs.yfi.address].callsReturnContext[0].returnValues[0];
    const balanceOf = BigInt(multicallResults[programs.yfi.address].callsReturnContext[1].returnValues[0].hex);
    const tvl = Number(balanceOf / (10n ** BigInt(decimals))) * prices[1];
    results.push({
      address: programs.veyfi.address,
      name: programs.veyfi.name, 
      tvl
    });
  }

  {
    const decimals = multicallResults[programs.yeth.address].callsReturnContext[0].returnValues[0];
    const totalSupply = BigInt(multicallResults[programs.yeth.address].callsReturnContext[1].returnValues[0].hex);
    const tvl = Number(totalSupply / (10n ** BigInt(decimals))) * prices[2];
    results.push({
      address: programs.yeth.address,
      name: programs.yeth.name, 
      tvl
    });
  }

  return results;
}

router.get('/', async function(req, res) {
  try {
    const result = await fetchProgramVaults();
    res.status(200).send(result);
  } catch(error) {
    console.log('error', error);
    res.status(500).send(error);
  }

});

module.exports = router;