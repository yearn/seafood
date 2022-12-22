const axios = require('axios');
const express = require('express');
const router = express.Router();

router.post('/callback', async function(req, res, next) {
	try {
		const result = await axios({
			method: 'post',
			headers: {accept: 'application/json'},
			url: 'https://github.com/login/oauth/access_token'
				+ `?client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}`
				+ `&client_secret=${process.env.GITHUB_CLIENT_SECRET}`
				+ `&code=${req.body.code}`
		});

		if(result.data.error) {
			console.log('error', response.data.error);
			res.status(500).send('An error occurred creating a GitHub access token.');
		} else {
			res.status(200).send({bearer: result.data.access_token});
		}

	} catch(error) {
    console.log('error', error);
    res.status(500).send('An error occurred creating a GitHub access token.');
	}
});

module.exports = router;