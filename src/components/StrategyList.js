import React, {useState,useEffect} from 'react';
import {AllStrats, AllVaults} from  '../ethereum/EthHelpers';
import {GetExplorerLink} from '../utils/utils';
import ContractActions from './ContractActions';

import {BsBoxArrowInUpRight, BsClipboardPlus} from 'react-icons/bs';



function StrategyButtons({provider, vault, onSelect}){
	let [strats, setAll] = useState([]);

	let [strat, setStrat] = useState(null);
	console.log(vault);


	useEffect(() => {
		AllVaults(vault, provider).then(v => {
			AllStrats(v, provider).then(s =>
			{
				setAll(s);
			});
		});}, [vault, provider, onSelect]);
		

	if(strats.length ==0){
		return(
			<div>{'loading...'}</div>
		);
	}

	return(<div>
		
		<div>
			{strat == null && strats.map((strat) => {
            
        
				
				return <div key={strat.address}><button  onClick={() => setStrat(strat)}> {strat.name}{' - '}{vault.address}</button>< BsClipboardPlus onClick={() => navigator.clipboard.writeText(strat.address)} /><a href={GetExplorerLink(provider, strat.address)}>< BsBoxArrowInUpRight   /></a></div>;
				
			})}
			{strat && <ContractActions block={strat} onSelect={onSelect} />}
            
		</div>

    
	</div>

	);
}



export default StrategyButtons;