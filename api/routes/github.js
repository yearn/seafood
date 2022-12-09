const axios = require('axios');
const express = require('express');
const router = express.Router();

router.post('/callback', async function(req, res) {
	try {
		const response = await axios({
			method: 'post',
			headers: {accept: 'application/json'},
			url: 'https://github.com/login/oauth/access_token'
				+ `?client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}`
				+ `&client_secret=${process.env.GITHUB_CLIENT_SECRET}`
				+ `&code=${req.body.code}`
		});
		if(response.data.error) {
			console.log('response.data.error', response.data.error);
			res.status(500).send('An error occurred');
		} else {
			res.status(200).send({...response.data});
		}
	} catch(error) {
		console.log(error);
		res.status(500).send('An error occurred');
	}
});

router.post('/refreshToken', async function(req, res) {
	try {
		const response = await axios({
			method: 'post',
			headers: {accept: 'application/json'},
			url: 'https://github.com/login/oauth/access_token'
				+ `?client_id=${process.env.GITHUB_CLIENT_ID}`
				+ `&client_secret=${process.env.GITHUB_CLIENT_SECRET}`
				+ '&grant_type=refresh_token'
				+ `&refresh_token=${req.body.refresh_token}`
		});
		if(response.data.error) {
			console.log('response.data.error', response.data.error);
			res.status(500).send('An error occurred');
		} else {
			res.status(200).send({...response.data});
		}
	} catch(error) {
		console.log(error);
		res.status(500).send('An error occurred');
	}
});

module.exports = router;