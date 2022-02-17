var express = require('express');
var router = express.Router();


const reports_model = require('../database/reports_model');


router.get('/All', function(req, res, next) {
	reports_model.getReports()
		.then(response => {
			res.status(200).send(response);
		})
		.catch(error => {
			res.status(500).send(error);
		});
});

module.exports = router;