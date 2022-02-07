import {AllStrats} from  "../ethereum/EthHelpers"
import HarvestMultiple from  "../ethereum/HarvestMultiple"
import useRPCProvider from '../context/useRpcProvider'
import { useState, useEffect, useCallback } from "react";

function RatioAdjust({strats}){
    //<form onSubmit={listItems}></form>
    function handleChange(event) {
        console.log(event.target.value);
      }
    
      function handleSubmit() {
        alert('An essay was submitted: ');
      }

    const listItems = strats.map((strat) => (
		<div key={strat.address}> 
			<br />
            <label>Strat: {strat.name} - Real ratio: {(100*strat.beforeDebt/strat.vaultAssets).toLocaleString(undefined, {maximumFractionDigits:2})}% - Desired ratio:  
            <textarea key={strat.address} value={(strat.debtRatio/100).toLocaleString(undefined, {maximumFractionDigits:2})} onChange={handleChange}/>
            </label>
    		
			
      </div>
	));

    

    return(<div>
        
        <form onSubmit={handleSubmit}>
        {listItems}
        </form>
          </div>
          
    );

}

export default RatioAdjust;