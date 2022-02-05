import { useState } from "react";
import {AllVaults} from  "../ethereum/EthHelpers"

import useRPCProvider from '../context/useRpcProvider'
const { ethers } = require("ethers");


function ShowVault() {
    const {tenderlyProvider, initProvider, setupTenderly} = useRPCProvider();

    const allV = []

    AllVaults().then(v => allV = v)

    tenderlyProvider
    .getBlockNumber()
    .then((response) => {
        console.log(response);
      return response;
      
    })
    .then((data) => {
      
      console.log(data);
    });
    

    return(
        <div>{allV}</div>
    )

}

export default ShowVault;