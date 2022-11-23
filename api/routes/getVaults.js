const express = require('express');
const router = express.Router();

const reports_model = require('../database/reports_model');
const masterchef_model = require('../database/masterchef_model');
const vaults_model = require('../database/vaults_model');

router.post('/AllVaults', function(req, res, next) {
	vaults_model.getVaults(String(req.body.chainId))
		.then(response => {
			res.status(200).send(response);
		})
		.catch(error => {
			res.status(500).send(error);
		});
});

router.post('/AllStrategyReports', function(req, res, next) {
	reports_model.getReports(req.body)
		.then(response => {
			res.status(200).send(response);
		})
		.catch(error => {
			res.status(500).send(error);
		});
});

router.post('/AllMasterchefs', function(req, res, next) {
	masterchef_model.getChefs(String(req.body.chainId))
		.then(response => {
			res.status(200).send(response);
		})
		.catch(error => {
			res.status(500).send(error);
		});
});

module.exports = router;