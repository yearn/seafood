import {lpDepositer, solidlyPair, solidlyRouter, solidexStakingRewards, solidlygauge, solidexFeeDistributor, veNFTContract} from '../abi';
import {solidexLpDepositer,  solidlyRouterAddress, sex, wftm, solid, solidsex, solidexStakingRewardsAddress, yfi, woofy, solidexFeeDistributorAddress, oxDaoStaker, veNFT} from './Addresses';
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

	let guage = solidlyGaugeContract(await lpDepositer.gaugeForPool(lp), provider);

	console.log('guage tings');

	let balanceOfGuage = await guage.balanceOf(lpDepositer.address);
	let derivedBalance = await guage.derivedBalance(lpDepositer.address);

	let balanceOfGuageOx = await guage.balanceOf(oxDaoStaker());
	let derivedBalanceOx = await guage.derivedBalance(oxDaoStaker());
	console.log((derivedBalance/balanceOfGuage)*2.5);

    

    

	return{
		address: lp,
		name: name,
		contract: lpContract,
		sexRewards: pendingRewards[0].sex/1e18,
		solidRewards: pendingRewards[0].solid/1e18,
		tokenABalance: {address: tokenA, balance: balances.amountA/1e18},
		tokenBBalance: {address: tokenB, balance: balances.amountB/1e18},
		price: price/1_000_000_000,
		dexScreener: GetDexScreener(lp, provider),
		solidsexBoost: (derivedBalance/balanceOfGuage)*2.5,
		oxdaoBoost: (derivedBalanceOx/balanceOfGuageOx)*2.5
	};


}   

async function StakedSolidsex(user, provider){
	console.log('Solidex State:');

	let stakingRewards =  solidexStakingRewardsContract(provider);
	
	let pendingSolid =  await stakingRewards.earned(user, solid());
	let pendingSex =  await stakingRewards.earned(user, sex());
	let balance = await stakingRewards.balanceOf(user);

    

	return{
		
		sexRewards: pendingSex/1e18,
		solidRewards: pendingSolid/1e18,
        
		tokenABalance: {address: solidsex(), balance: balance/1e18},
		
	};


}   

async function StakedSex(user, provider){

	let feeDistributor = solidexFeeDistributorContract(provider);

	
	
	let pendingSolidsex =  await feeDistributor.claimable(user, [solidsex()]);
	
    

	return{
		solidRewards: 0,
		sexRewards: 0,
		solidsexRewards: pendingSolidsex/1e18,
        
		
	};


} 


async function StakedVeNft(user, provider){

	let nft = veNContract(provider);

	let tokenId = 13427;
	let solid_balance = (await nft.locked(tokenId))[0];

	console.log(solid_balance);



	return{
		solidRewards: 0,
		sexRewards:0,
		tokenABalance: {address: solid(), balance: solid_balance/1e18},
        
		
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
	if(address === yfi() ){
		return('yfi');
	}
	if(address === woofy()){
		return('woofy (18d)');
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
function solidexStakingRewardsContract(provider){
	
	return new ethers.Contract(solidexStakingRewardsAddress(), solidexStakingRewards, provider);

}
function solidexFeeDistributorContract(provider){
	
	return new ethers.Contract(solidexFeeDistributorAddress(), solidexFeeDistributor, provider);

}

function solidlyGaugeContract(gauge, provider){
	
	return new ethers.Contract(gauge, solidlygauge, provider);

}

function veNContract(provider){
	
	return new ethers.Contract(veNFT() , veNFTContract, provider);

}

export {LpState,StakedSex, StakedVeNft,FindName, StakedSolidsex};
