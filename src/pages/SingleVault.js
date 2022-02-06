import {AllStrats} from  "../ethereum/EthHelpers"
import HarvestMultiple from  "../ethereum/HarvestMultiple"
import useRPCProvider from '../context/useRpcProvider'
import { useState } from "react";



function SingleVaultPage(singleVault){
    const {tenderlyProvider, initProvider, closeProvider, defaultProvider, setupTenderly} = useRPCProvider();

    let [allS, setAlls] = useState([])
    let [harvestedS, setHarvested] = useState([])
    let [harvesting, setHarvesting] = useState(false)

    console.log("inputting ", singleVault)
    AllStrats(singleVault).then(v => { setAlls(v)})
    
    if(allS.length ==0){
        return(
          <div>loading strats...</div>
      )
      }
      console.log(allS)

      if(harvesting){
        HarvestMultiple(allS).then(v => { 
            setHarvesting(false)
            setHarvested(v)
            })
      }

      const listItems = allS.map((strat) =>
      <div key={strat.address}> 
      <br />
        <div>Strat: {strat.name} - {strat.address}</div>
        <div>Lastharvest: {strat.lastTime.toLocaleString(undefined, {maximumFractionDigits:2})}h - Real ratio: {(strat.beforeDebt/strat.vaultAssets).toLocaleString(undefined, {maximumFractionDigits:2})}% - Desired ratio: {(strat.debtRatio/100).toLocaleString(undefined, {maximumFractionDigits:2})}% </div>
      </div>
  );

  return(
    <div><button  onClick={() => {
        setHarvesting(true)

    }}> Harvest All?</button>
    <div>{harvesting ? "harvesting" : ""}</div>
        
        {listItems}</div>
)
}



export default SingleVaultPage;