
import {BsBoxArrowInUpRight} from 'react-icons/bs';
import React from 'react';
import {GetExplorerTx} from '../utils/utils';
function HistoricReports({history}){

	// const [all, setAll] = useState([]);
    
	// useEffect(() => {
	// 	try{
	// 		axios.post('api/getVaults/AllStrategyReports', strategy).then((response) => {
	// 			console.log(response.data);
	// 			setAll(response.data);
	// 		});
	// 	}catch{console.log('eth failed');
	// 	}
	// }, [strategy]);
	console.log('history', history);
	return <div>
		<br />
		{history.map(e => {
			let time = new Date(e.timestamp*1000);


			return <div key={e.txn_hash}> <span>{
                
				'harvest ' + time.toGMTString() + ', gain: ' + parseFloat(e.total_gain).toLocaleString(undefined, {maximumFractionDigits:5}) + ', gain(usd): ' + parseFloat(e.want_gain_usd).toLocaleString(undefined, {style:'currency', currency:'USD'}) + ', APR: ' + parseFloat(e.rough_apr_pre_fee*100).toLocaleString(undefined, {maximumFractionDigits:2}) + '%'
            
			}</span>{<a href={GetExplorerTx(e.chain_id, e.txn_hash)}>< BsBoxArrowInUpRight   /></a>}</div>;
			
		})}
	</div>;
}



export default HistoricReports;