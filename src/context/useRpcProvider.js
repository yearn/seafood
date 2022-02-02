import { ethers } from "ethers";
import React, { useContext, createContext, useState } from "react";

const RPCProvider = createContext();
export const RPCProviderContextApp = ({ children }) => {
  const [useProvider, setUseProvider] = useState(null);

  const [tenderlyProvider, setTenderly] = useState(null);

  function initProvider() {
    const provider = new ethers.providers.WebSocketProvider(
      "wss://erigon:iAlBsaOWZtIrYNMR4a4J@node.yearn.network"
    );
    console.log(provider);
    console.log("provider created");
    setTenderly(provider);
    console.log(provider);
  }

  function closeProvider() {
    setTenderly(null);
  }

  function setupTenderly() {
    const fork_base_url = "https://simulate.yearn.network/fork";
    const payload = { network_id: "1" };
    console.log("start");
    const resp = fetch(fork_base_url, {
      method: "POST",
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        console.log(data["simulation_fork"]["id"]);
        setTenderly(new ethers.providers.JsonRpcProvider(
          "https://rpc.tenderly.co/fork/" + data["simulation_fork"]["id"]
        ));
        console.log(tenderlyProvider);
      });
  }

  return (
    <RPCProvider.Provider
      value={{
        useProvider,
        initProvider,
        closeProvider,
        setupTenderly,
        tenderlyProvider
      }}
    >
      {children}
    </RPCProvider.Provider>
  );
};

export const useRpcProvider = () => useContext(RPCProvider);
export default useRpcProvider;
