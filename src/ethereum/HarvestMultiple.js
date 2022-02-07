import {AllStrats} from  "../ethereum/EthHelpers"
import useRPCProvider from '../context/useRpcProvider'
import { useState } from "react";
import { ethers } from "ethers";
import {StratInfo} from  "../ethereum/EthHelpers"

async function HarvestMultiple(strats, vault, tenderlyProvider){
    //const {tenderlyProvider, initProvider, closeProvider, defaultProvider, setupTenderly} = useRPCProvider();\
    console.log("harvest multiple " + tenderlyProvider)
    if(!tenderlyProvider){
        return;
    }
    let stratsOutput = []
    let con = vault.contract
    let contractReadOnly = con.connect(tenderlyProvider);

    console.log(tenderlyProvider)
    let signer = tenderlyProvider.getSigner(strats[0].governance)

    
    for(const strat of strats){
        console.log(strat)
        const stratWithSigner = strat.contract.connect(signer)
        let x = await stratWithSigner.harvest({
            gasLimit: 8_000_000, gasPrice:0
        })
        console.log(x)
        let success = true;
        try{
            await x.wait()
            let params = await contractReadOnly.strategies(strat.address)
            strat.paramsAfter = params
            
        }catch(e){
            success = false
        }

        strat.tenderlyId = await tenderlyProvider.send("evm_getLatest", [])
        strat.tenderlyURL = "https://dashboard.tenderly.co/yearn/yearn-web/fork/" + tenderlyProvider.connection.url.substring(29) +"/simulation/" + strat.tenderlyId

        strat.succeded = success
        
        //strat.tenderlyUrl = 
        
        
    }

    return strats

}

export default HarvestMultiple;