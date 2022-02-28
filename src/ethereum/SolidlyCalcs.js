import {lpDepositer, solidlyPair, solidlyRouter} from '../interfaces/interfaces';
import {solidexLpDepositer,  solidlyRouterAddress, sex, wftm, solid, solidsex} from './Addresses';
import {GetDexScreener} from './EthHelpers';

const {ethers} = require('ethers');




async function LpState(lp, user, provider){
	console.log('Lp State:');

	let lpDepositer =  solidexLpDepositerContract(provider);
	let lpContract = solidlyLp(lp, provider);
	let router = solidlyRouterContract(provider);

	let tokenA = await lpContract.token0();
	let tokenB = await lpContract.token1();
	let stable = await lpContract.stable();

	let lps = [lp];
	let pendingRewards = await lpDepositer.pendingRewards(user, lps);
	console.log(pendingRewards);
	let balance = await lpDepositer.userBalances(user, lp);

	let price = await lpContract.current(tokenA, 1_000_000_000);


	let balances = await router.quoteRemoveLiquidity(tokenA, tokenB, stable, balance);
	let name = await lpContract.name();

    

	return{
		address: lp,
		name: name,
		contract: lpContract,
		sexRewards: pendingRewards[0].sex/1e18,
		solidRewards: pendingRewards[0].solid/1e18,
		tokenABalance: {address: tokenA, balance: balances.amountA/1e18},
		tokenBBalance: {address: tokenB, balance: balances.amountB/1e18},
		price: price/1_000_000_000,
		dexScreener: GetDexScreener(lp, provider)
	};


}   

function FindName(address){
	if(address === sex()){
		return('sex');
	}
	if(address === solid()){
		return('solid');
	}
	if(address === solidsex()){
		return('solidsex');
	}
	if(address === wftm()){
		return('wftm');
	}

}

// async function StakedState(lps, user){
// 	console.log('Lp State:');


// }   


// async function Erc20Info(token, provider){
// 	let s = new ethers.Contract(token, erc20, provider);
// 	//console.log(params)
// 	let decimals = await s.decimals();
// 	console.log(provider);
    
// 	let name = await s.name();
// 	return {
// 		name: name,
// 		contract: s,
// 		address: token,
// 		decimals: decimals,
// 		url: GetUrl(token, provider),
// 		dexScreener: GetDexScreener(token, provider)
        
// 	};
    
// }

function solidexLpDepositerContract(provider){
	
	return new ethers.Contract(solidexLpDepositer(), lpDepositer, provider);

}
function solidlyRouterContract(provider){
	
	return new ethers.Contract(solidlyRouterAddress(), solidlyRouter, provider);

}
function solidlyLp(lp, provider){
	
	return new ethers.Contract(lp, solidlyPair, provider);

}

export {LpState, FindName};
