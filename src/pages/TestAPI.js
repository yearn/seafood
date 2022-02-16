import React, {useEffect, useState} from 'react';
import axios from '../axios';

function TestAPI() {
	const [result, setResult] = useState('');
	useEffect(() => {
		axios.get('api/testAPI').then((response) => {
			console.log(response.data);
			setResult(response.data);
		});
	}, []);

	return (
		<div>{'Working ', result}</div>
	);
}

export default TestAPI;