const express = require('express');
const router = express.Router();

const reports_model = require('../database/reports_model');

router.post('/AllStrategyReports', function(req, res, next) {
	reports_model.getReports(req.body)
		.then(response => {
			res.status(200).send(response);
		})
		.catch(error => {
			res.status(500).send(error);
		});
});

module.exports = router;