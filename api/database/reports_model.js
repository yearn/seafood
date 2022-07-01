const Pool = require('pg').Pool;
const pool = new Pool({
	user: process.env.REACT_APP_DB_USER,
	host: '34.205.72.180',
	database: 'reports',
	password: process.env.REACT_APP_DB_PASS,
	port: 5432,
});

var format = require('pg-format');

const getReports = (strat) => {

	return new Promise(function(resolve, reject) {

		const text = format('SELECT * FROM reports WHERE strategy_address = %L ORDER BY block DESC LIMIT 100', strat.address);
		pool.query(text, (error, results) => {
			if (error) {
				reject(error);
			}
			
			
			resolve(results.rows);
		});
	}); 
};
module.exports = {
	getReports,
};