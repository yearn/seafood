import {registry, erc20, vault030, vault043, strategy,masterchef, masterchefstrat} from '../interfaces/interfaces';
const {ethers} = require('ethers');

let all = [];

async function AllStrats(vault, defaultProvider){
    console.log('All Strats');

    let strats = [];
    
    let currentTime = Date.now()/1000;
    
    //console.log("received ", vault)
    let con = vault.contract;
    let totalAssets = await con.totalAssets();
    let gov = await con.governance();
    //console.log("gov is", gov)


    for(let i = 0; i <20 ; i++){
        const s = await con.withdrawalQueue(i);
        if(s == '0x0000000000000000000000000000000000000000'){
            break;
        }
        strats.push(await StratInfo(con, s, defaultProvider, currentTime, totalAssets, gov));
    }

    return strats;
}   

async function GetMasterchef(strats, provider){
    
    
    let masterChefs = [];
    for(let strat of strats){
        
        let s = await Masterchefinfo(strat, provider);
        masterChefs.push(s);
    }

    return masterChefs;
}  

async function Masterchefinfo(strat, provider){
    let s = new ethers.Contract(strat, masterchefstrat, provider);
    let name = await s.name();
    console.log(name);

    let masterchef = await masterchefContract(await s.masterchef(), provider);
    let pid = await s.pid();
    let emissionToken = await Erc20Info(await s.emissionToken(), provider);
    let vault =  new ethers.Contract(await s.vault(), vault043, provider);
    let token = await Erc20Info(await vault.token(), provider);

    let currentDeposits = await s.balanceOfStaked();

    let totalMasterChefDeposits = await (token.contract).balanceOf(masterchef.address);
    //let pair = null;
    if(provider.network.chainId === 250){
        //fantom
        //spookyFacot
    }

    
    
    return {
        name: name,
        url: GetUrl(strat, provider),
        address: strat,
        contract: s,
        masterchef: masterchef,
        pid: pid,
        wantToken: token,
        emissionToken: emissionToken,
        currentDeposits: currentDeposits / (10 ** token.decimals),
        totalMasterChefDeposits: totalMasterChefDeposits / (10 ** token.decimals)

    };
    
}



// eslint-disable-next-line no-unused-vars
async function AllRegistered(defaultProvider){
    const regist = Registry( defaultProvider);
    const vaults = [];
    const numTokens = await regist.numTokens();
    for (let i = 0; i < numTokens; i++){
        const token = await regist.tokens(i);
        const vault = regist.latestVault(token);
        vaults.push(vault);
    }
    return vaults;
}


async function AllVaults(defaultProvider){
    //console.log("All Vaults");

    if(all.length >0){
        //console.log("hit all " +all.length)  
        return all;
    }

    // eslint-disable-next-line no-unused-vars
    let privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123';

    let selectVaults = ['0xdA816459F1AB5631232FE5e97a05BBBb94970c95', '0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE', '0xa258C4606Ca8206D8aA700cE2143D7db854D168c', '0x7Da96a3891Add058AdA2E826306D812C638D87a7'];


    //let walletWithProvider = new ethers.Wallet(privateKey, tenderlyProvider);

    // eslint-disable-next-line no-unused-vars
    const regist = Registry( defaultProvider);
    //const dai = Dai(walletWithProvider)
    //console.log(await dai.balanceOf("0x6B175474E89094C44Da98b954EedeAC495271d0F"));

    /*await dai.approve("0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e", 100, {
        gasLimit: 0, gasPrice:0
    })*/
    
    
    
    const vaults = [];

    //console.log(numTokens)
    /*for (let i = 0; i < numTokens; i++){
        /*for(let j = 0; j <20 ; j++){
            const token = await regist.tokens(i)
           
            const vault = await regist.vaults(token, j)
            if(vault == '0x0000000000000000000000000000000000000000'){
                break;
            }
            console.log(vault)
            let vaultData = await GetVaultInfo(vault, defaultProvider)
            vaults.push(vaultData)
        }/
        const token = await regist.tokens(i)
        const vault = await regist.latestVault(token)
        console.log(vault)
        let vaultData = await GetVaultInfo(vault, defaultProvider)
        vaults.push(vaultData)

        
    }*/
    for(let v of selectVaults){
        let vaultData = await GetVaultInfo(v, defaultProvider);
        vaults.push(vaultData);
    }

    all = vaults;
    
    //console.log(all.length)  
    return all;

}

async function GetVaultInfo(vault, provider){
    let s = new ethers.Contract(vault, vault043, provider);
    let version = await s.apiVersion();
    if( version.includes('0.3.0') || version.includes('0.3.1')){
        s = new ethers.Contract(vault, vault030, provider);
    }
    let name = await s.name();
    let debtRatio = await s.debtRatio();
    let token = await Erc20Info(await s.token(), provider);
    let totalAssets = await s.totalAssets();
    let totalDebt = await s.totalDebt();
    //console.log(totalAssets)
    //console.log(totalDebt)

    return {
        name: name,
        contract: s,
        address: vault,
        version: version,
        debtRatio: debtRatio,
        token: token,
        totalAssets: totalAssets,
        totalDebt: totalDebt
    };
    
}



async function StratInfo(vault, strat, provider, currentTime, totalAssets, gov){
    let s = new ethers.Contract(strat, strategy, provider);
    let params = await vault.strategies(strat);
    //console.log(params)
    
    let name = await s.name();
    return {
        name: name,
        contract: s,
        address: strat,
        beforeDebt: params.totalDebt,
        beforeGain: params.totalGain,
        beforeLoss: params.totalLoss,
        debtRatio: params.debtRatio,
        lastTime: (currentTime- params.lastReport)/60/60,
        vaultAssets: totalAssets,
        governance: gov
    };
    
}

async function Erc20Info(token, provider){
    let s = new ethers.Contract(token, erc20, provider);
    //console.log(params)
    let decimals = await s.decimals();
    console.log(provider);
    
    let name = await s.name();
    return {
        name: name,
        contract: s,
        address: token,
        decimals: decimals,
        url: GetUrl(token, provider),
        dexScreener: GetDexScreener(token, provider)
        
    };
    
}


function GetUrl(address, provider){

    if(provider.network.chainId === 250){
        return "https://ftmscan.com/address/" + address;
    }

    return "https://etherscan.io/address/" + address;
    
}
function GetDexScreener(address, provider){

    if(provider.network.chainId === 250){
        return "https://dexscreener.com/fantom/" + address;
    }

    return "https://dexscreener.com/ethereum/" + address;
    
}

async function masterchefContract(address, provider){
    console.log(address);
    let s = new ethers.Contract(address, masterchef, provider);
    console.log(s);
    let endTime = await s.poolEndTime(); 
    
    let currentTime = Date.now()/1000;
    
    return {
        contract: s,
        address: address,
        endTime: endTime,
        timeLeft: endTime> currentTime ?  (endTime-currentTime)/60/60 : 0,
        url: GetUrl(address, provider)
    };
    
}

function Registry(provider){
    console.log('registering registry');
    return new ethers.Contract('0x50c1a2eA0a861A967D9d0FFE2AE4012c2E053804', registry, provider);
    //return new ethers.Contract("0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e", registry, provider);
    
}

// eslint-disable-next-line no-unused-vars
function Strategy(strat, provider){
    console.log('registering strat');
    return new ethers.Contract(strat, strategy, provider);
    
}
// eslint-disable-next-line no-unused-vars
function Dai(provider){
    console.log('registering Dai');
    return new ethers.Contract('0x6B175474E89094C44Da98b954EedeAC495271d0F', erc20, provider);
    //return new ethers.Contract("0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e", registry, provider);
    
}

export {AllVaults, AllStrats, StratInfo, Erc20Info, GetMasterchef};
