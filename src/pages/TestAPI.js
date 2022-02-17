import React, {useEffect, useState} from 'react';
import axios from '../axios';

function TestAPI() {
	const [result, setResult] = useState('');
	useEffect(() => {
		axios.get('api/getVaults/All').then((response) => {
			console.log(response.data);
			setResult(response.data);
		});
	}, []);


	let  ethItems ='';
	if(result.length > 0){
		ethItems = result.map(row => <div key={row.id}> {row.block}</div>);
	}
	 
	return (
		<div>{ethItems}</div>
	);
}

export default TestAPI;