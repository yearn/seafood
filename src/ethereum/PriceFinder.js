import {univ2router, solidlyRouter,} from '../interfaces/interfaces';
import {spookyRouterAddress, solidlyRouterAddress, sex, wftm,  daiFantom} from './Addresses';

const {ethers} = require('ethers');




async function GetPrices(tokens, provider){
	console.log('Getting prices:');

	if(provider.network.chainId != 250){
		console.log('returning');
		return;
	}
    
	const ftmPrice = await GetWFTMPrice(provider);

	const prices = [];

	for(const toke of tokens){

		if(toke === wftm()){
			prices[toke] = ftmPrice;
		}else{
			const price = await GetFTMPrice(toke, provider);
			prices[toke] = ftmPrice*price;
		}
        
		

	}
    

    

	return prices;


}   

async function GetFTMPrice(token, provider){
	const amount = 1_000_000_000;

	let priceInFTM = 0;
	if(token === sex()){
		//use solidly
		const solidexRouter = solidlyRouterContract(provider);
		const path = [[token, wftm(), false]];
		priceInFTM = (await solidexRouter.getAmountsOut(amount, path) )[1];
	}else{
		const spookyRouterContract = UniRouter(spookyRouterAddress(), provider);
		const path = [token, wftm()];
		priceInFTM = (await spookyRouterContract.getAmountsOut(amount, path) )[1];
	}
	


	return priceInFTM/amount;


}   

async function GetWFTMPrice(provider){
	

	const amount = 1_000_000_000;
	const spookyRouterContract = UniRouter(spookyRouterAddress(), provider);
	const path = [wftm(), daiFantom()];
	return (await spookyRouterContract.getAmountsOut(amount, path) )[1]/amount;


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

function solidlyRouterContract(provider){
	
	return new ethers.Contract(solidlyRouterAddress(), solidlyRouter, provider);

}
function UniRouter(address, provider){
	
	return new ethers.Contract(address, univ2router, provider);

}

export {GetPrices};
