import { useState } from "react";

import useRPCProvider from '../context/useRpcProvider'
const { ethers } = require("ethers");


function ShowVault() {
    const {tenderlyProvider, initProvider, setupTenderly} = useRPCProvider();

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
        <div></div>
    )

}

export default ShowVault;