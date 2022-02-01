import { useState } from "react";
const { ethers } = require("ethers");

function ConnectR() {
  const [isLoading, setIsLoading] = useState(true);
  const [loaded, setLoaded] = useState();
  console.log("hello");
  const provider = new ethers.providers.JsonRpcProvider(
    "https://erigon:iAlBsaOWZtIrYNMR4a4J@node.yearn.network"
    //"https://opera:zgNmpZno8CFXCVvHm7I2JZ6NETmEotAA@fantom.yearn.science"
  );
  console.log("hell3o");
  console.log(provider);

  provider
    .getBlockNumber()
    .then((response) => {
      return response;
    })
    .then((data) => {
      setIsLoading(false);
      setLoaded(data);
    });

  if (isLoading) {
    return "loading";
  }
  console.log("hell4o");
  return loaded;
}

export default ConnectR;
