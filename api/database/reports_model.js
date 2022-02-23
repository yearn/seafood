const Pool = require('pg').Pool;
const pool = new Pool({
	user: 'wavey',
	host: '34.205.72.180',
	database: 'reports',
	password: 'wavey',
	port: 5432,
});

var format = require('pg-format');

const getReports = (strat) => {

	return new Promise(function(resolve, reject) {

		const text = format('SELECT * FROM reports WHERE strategy_address = %L LIMIT 5', strat.address);
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