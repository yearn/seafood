import useRPCProvider from '../context/useRpcProvider'
import {registry, erc20, vault030, vault043} from '../interfaces/interfaces';
const { ethers } = require("ethers");


let all = []


async function AllVaults(){
    const {tenderlyProvider} = useRPCProvider();
    if(all.length >0){
        console.log("hit all " +all.length)  
        return all;
    }

    let privateKey = "0x0123456789012345678901234567890123456789012345678901234567890123";


    //let walletWithProvider = new ethers.Wallet(privateKey, tenderlyProvider);

    const regist = Registry( tenderlyProvider);
    //const dai = Dai(walletWithProvider)
    //console.log(await dai.balanceOf("0x6B175474E89094C44Da98b954EedeAC495271d0F"));

    /*await dai.approve("0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e", 100, {
        gasLimit: 0, gasPrice:0
    })*/

    
    console.log(regist);
    await regist.tokens(0)
    const vaults = [];
    console.log(regist);

    console.log(await regist.tokens(0));
    const numTokens = await regist.numTokens();
    console.log(numTokens)
    for (let i = 0; i < numTokens; i++){
        for(let j = 0; j <20 ; j++){
            const token = await regist.tokens(i)
           
            const vault = await regist.vaults(token, j)
            if(vault == '0x0000000000000000000000000000000000000000'){
                break;
            }
            console.log(vault)
            let vaultData = await GetVaultInfo(vault, tenderlyProvider)
            vaults.push(vaultData)
        }
        
    }
    all = vaults
    
    console.log(all.length)  
    return all

}

async function GetVaultInfo(vault, provider){
    let s = new ethers.Contract(vault, vault043, provider);
    let version = await s.apiVersion()
    if( version.includes("0.3.0") || version.includes("0.3.1")){
        s = new ethers.Contract(vault, vault030, provider);
    }
    let name = await s.name()
    return {
        name: name,
        contact: s,
        address: vault,
        version: version
    }
    
}

function Registry(provider){
    console.log("registering registry")
    return new ethers.Contract("0x50c1a2eA0a861A967D9d0FFE2AE4012c2E053804", registry, provider);
    //return new ethers.Contract("0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e", registry, provider);
    
}
function Dai(provider){
    console.log("registering Dai")
    return new ethers.Contract("0x6B175474E89094C44Da98b954EedeAC495271d0F", erc20, provider);
    //return new ethers.Contract("0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e", registry, provider);
    
}

export {AllVaults}