import {AllStrats} from  "../ethereum/EthHelpers"
import HarvestMultiple from  "../ethereum/HarvestMultiple"
import useRPCProvider from '../context/useRpcProvider'
import { useState, useEffect, useCallback } from "react";



function SingleVaultPage(singleVault){
  const {tenderlyProvider, initProvider, closeProvider, defaultProvider, setupTenderly} = useRPCProvider();

    let [allS, setAlls] = useState([])
    let [harvestedS, setHarvested] = useState([])

    console.log("inputting ", singleVault)
    useEffect(() => {
      AllStrats(singleVault, defaultProvider).then(v => { setAlls(v)})
    }, []);

    const	onHarvestMultiple = useCallback(async () => {
      const	_harvested = await HarvestMultiple(allS, singleVault, tenderlyProvider);
      setHarvested(_harvested, []);
    }, [tenderlyProvider, allS, singleVault]);

    const showApr = (strat) =>{
      if(!strat.succeded){
        return
      }

      let profit = strat.paramsAfter.totalGain - strat.beforeGain
        let loss = strat.paramsAfter.totalLoss - strat.beforeLoss
        let percent = 0
        console.log(strat.paramsAfter.totalGain)
        console.log(strat.beforeGain)
        console.log(profit)
        if (strat.beforeDebt > 0){
          if (loss > profit){
              percent = -1 * loss / strat.beforeDebt 
          }else{
            percent = profit / strat.beforeDebt
          }
        }
        let over_year = (100*percent * 8760 / strat.lastTime).toLocaleString(undefined, {maximumFractionDigits:2})
            
      return " APR " + over_year + "%"
    }
    if(allS.length ==0){
        return(
          <div>loading strats...</div>
      )
      }
      console.log(allS)
      console.log(harvestedS)

      const listItems = allS.map((strat) =>
      <div key={strat.address}> 
      <br />
        <div>Strat: {strat.name} - {strat.address}</div>
        <div>Lastharvest: {strat.lastTime.toLocaleString(undefined, {maximumFractionDigits:2})}h - Real ratio: {(100*strat.beforeDebt/strat.vaultAssets).toLocaleString(undefined, {maximumFractionDigits:2})}% - Desired ratio: {(strat.debtRatio/100).toLocaleString(undefined, {maximumFractionDigits:2})}% </div>
        <div> {harvestedS.length > 0 ? strat.succeded ? showApr(strat) : "Failed Harvest" : ""}</div>
      </div>
  );

  return(
    <div><button  onClick={onHarvestMultiple}> Harvest All?</button>
        
        {listItems}</div>
)
}



export default SingleVaultPage;