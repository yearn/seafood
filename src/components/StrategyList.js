import React, {useState,useEffect} from 'react';
import {AllStrats, AllVaults} from  '../ethereum/EthHelpers';
import ContractActions from './ContractActions';



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
            
        
				
				return <div key={strat.address}><button  onClick={() => setStrat(strat)}> {strat.name}{' - '}{vault.address}</button></div>;
				
			})}
			{strat && <ContractActions block={strat} onSelect={onSelect} />}
            
		</div>

    
	</div>

	);
}



export default StrategyButtons;