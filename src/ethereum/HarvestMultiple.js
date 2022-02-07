import {AllStrats} from  "../ethereum/EthHelpers"
import useRPCProvider from '../context/useRpcProvider'
import { useState } from "react";
import { ethers } from "ethers";

async function HarvestMultiple(strats){
    const {tenderlyProvider, initProvider, closeProvider, defaultProvider, setupTenderly} = useRPCProvider();
    if(!tenderlyProvider){
        return;
    }

    console.log(tenderlyProvider)
    let signer = tenderlyProvider.getSigner(strats[0].governance)

    
    for(const strat of strats){
        console.log(strat)
        const stratWithSigner = strat.contract.connect(signer)
        let x = await stratWithSigner.harvest({
            gasLimit: 8_000_000, gasPrice:0
        })
        let success = true;
        try{
            await x.wait()
        }catch(e){
            success = false
        }
        
    }
    
    return tenderlyProvider

}

export default HarvestMultiple;