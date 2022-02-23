import axios from '../axios';

import React, {useState, useEffect} from 'react';
import {GetALink, GetExplorerTx} from '../utils/utils';
function HistoricReports({strategy}){

	const [all, setAll] = useState([]);
    
	useEffect(() => {
		try{
			axios.post('api/getVaults/AllStrategyReports', strategy).then((response) => {
				console.log(response.data);
				setAll(response.data);
			});
		}catch{console.log('eth failed');
		}
	}, [strategy]);

	return <div>
		<br />
		{all.map(e => {
			let time = new Date(e.timestamp*1000);
			let url = GetExplorerTx(e.chain_id, e.txn_hash);

			return <div key={e.txn_hash}>{GetALink(url, 'harvest ')} {
                
				time.toGMTString() + ', gain: ' + parseFloat(e.total_gain).toLocaleString(undefined, {maximumFractionDigits:5}) + ', gain(usd): ' + parseFloat(e.want_gain_usd).toLocaleString(undefined, {style:'currency', currency:'USD'}) 
            
			}</div>;
			
		})}
	</div>;
}



export default HistoricReports;