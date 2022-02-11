import React, {useState} from 'react';

function RatioAdjust({strats}){
	const [values, setValues] = useState({});
	const [nonce, setNonce] = useState(0);
	const [script, setScript] = useState();

	const handleChange = (fieldId, value) => {
		console.log(value);
		setValues(currentValues => {
			currentValues[fieldId] = value;
			return currentValues;
		});
		setNonce(nonce+1); //need to force update because react is stupid
	};

	//example how to iterate
	/*console.log(values)
  for (const [key, value] of Object.entries(values)) {
    console.log(`${key}: ${value}`);
  }*/
  
    
	function handleSubmit(event) {
		event.preventDefault();

		let unorderedList = [];
		for (const [key, value] of Object.entries(values)) {
			for(const strat of strats){
				if(strat.address === key){
					unorderedList.push({
						address: key,
						ratioChange: value*100-strat.debtRatio,
						newRatio: Math.floor(value*100)
					});
				}
			}
		}

		const sortedArray = [].concat(unorderedList)
			.sort((a, b) => a.ratioChange > b.ratioChange ? 1 : -1);
		console.log(sortedArray);

		let script = '\n@sign\ndef auto_debt_adjust():\n\tstrats=[]\n\t';

		let scripts = sortedArray.map(strat =>{
			return '\n\tstrat = safe.contract("' + strat.address + '")\n\tvault=safe.contract(strat.vault())\n\tvault.updateStrategyDebtRatio(strat, ' + strat.newRatio + ') #change of ' + strat.ratioChange + ' name: ' + strat.name + '\n\tstrats.append(strat)\n\t';
		});

		script = script + scripts.join('') + '\n\tharvest_n_check_many(safe, strats)\n\n\n\n/robowoofy fn=auto_debt_adjust send=true\n';

		setScript(script);


	}

	const listItems = strats.map((strat) => (
		<div key={strat.address}> 
			<br />
			<label>{'Strat: '}{strat.name}{' - Real ratio: '}{(100*strat.beforeDebt/strat.vaultAssets).toLocaleString(undefined, {maximumFractionDigits:2})}{'% - Desired ratio:  '}
				<textarea key={strat.address} value={values[strat.address] ? values[strat.address] : (strat.debtRatio/100).toLocaleString(undefined, {maximumFractionDigits:2})} onChange={event => handleChange(strat.address, event.target.value)}/>
			</label>
		</div>
	));

    

	return(<div>
        
		<form onSubmit={handleSubmit}>
			{listItems}
			<button>{'Generate sms code'}</button>
		</form>
		{script && <div  style={{whiteSpace: 'pre-wrap'}}>{script}</div>}
	</div>
          
          
	);

}

export default RatioAdjust;