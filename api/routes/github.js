const axios = require('axios');
const express = require('express');
const router = express.Router();

router.post('/callback', function(req, res, next) {
	axios({
		method: 'post',
		headers: {accept: 'application/json'},
		url: 'https://github.com/login/oauth/access_token'
			+ `?client_id=${process.env.GITHUB_CLIENT_ID}`
			+ `&client_secret=${process.env.GITHUB_CLIENT_SECRET}`
			+ `&code=${req.body.code}`
	}).then((response) => {
		if(response.data.error) {
			res.status(500).send(response.data.error);
		} else {
			res.status(200).send({bearer: response.data.access_token});
		}
	})
});

module.exports = router;