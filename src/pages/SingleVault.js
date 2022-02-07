import {AllStrats} from  "../ethereum/EthHelpers"
import HarvestMultiple from  "../ethereum/HarvestMultiple"
import useRPCProvider from '../context/useRpcProvider'
import { useState, useEffect, useCallback } from "react";



function SingleVaultPage({value}){
	const {tenderlyProvider, initProvider, closeProvider, defaultProvider, setupTenderly} = useRPCProvider();
    const [allS, setAlls] = useState([])
    const [harvestedS, setHarvested] = useState([])

    console.log("inputting ", value)

	//Handle the setAll
	const	onSetAll = useCallback(async () => {
		const	_all = await AllStrats(value, defaultProvider);
		setAlls(_all || []);
    }, [value, defaultProvider]);
	useEffect(() => onSetAll(), [onSetAll]);

	//Handle the button to harvest all
    const	onHarvestMultiple = useCallback(async () => {
		const	_harvested = await HarvestMultiple(allS, value, tenderlyProvider);
		setHarvested(_harvested || []);
    }, [tenderlyProvider, allS, value]);

    const showApr = (strat) => {
		if(!strat.succeded){
			return
		}

		let profit = strat.paramsAfter.totalGain - strat.beforeGain
        let loss = strat.paramsAfter.totalLoss - strat.beforeLoss
        let percent = 0
        if (strat.beforeDebt > 0) {
			if (loss > profit){
				percent = -1 * loss / strat.beforeDebt 
			} else {
				percent = profit / strat.beforeDebt
			}
		}
		let over_year = (100*percent * 8760 / strat.lastTime).toLocaleString(undefined, {maximumFractionDigits:2})    
      	return " APR " + over_year + "% ";
    }

    if(allS.length == 0) {
        return(<div>loading strats...</div>)
    }
    
	console.log(allS)
    console.log(harvestedS)

    const listItems = allS.map((strat) => (
		<div key={strat.address}> 
			<br />
			<div>Strat: {strat.name} - <a target="_blank" href={"https://etherscan.io/address/"+ strat.address}>{strat.address}</a></div>
    		<div>Lastharvest: {strat.lastTime.toLocaleString(undefined, {maximumFractionDigits:2})}h - Real ratio: {(100*strat.beforeDebt/strat.vaultAssets).toLocaleString(undefined, {maximumFractionDigits:2})}% - Desired ratio: {(strat.debtRatio/100).toLocaleString(undefined, {maximumFractionDigits:2})}% </div>
			<div>{harvestedS.length > 0 ? (strat.succeded ? showApr(strat) : "Failed Harvest ")  : ""} <a target="_blank" href={strat.tenderlyURL}>{harvestedS.length > 0 && "Tenderly Link"} </a></div>
      </div>
	));

	return(
		<div>
			<button disabled={!tenderlyProvider} onClick={onHarvestMultiple}> Harvest All?</button>
      
      <div>{value.name} - {value.version} - <a target="_blank" href={"https://etherscan.io/address/"+ value.address}> {value.address}</a> - {(value.debtRatio/100).toLocaleString(undefined, {maximumFractionDigits:2})}% Allocated - Free Assets: {((value.totalAssets - value.totalDebt) / (10 ** value.token.decimals)).toLocaleString(undefined, {maximumFractionDigits:2})}</div>
			{listItems}
		</div>
	);
}



export default SingleVaultPage;