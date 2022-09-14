const Pool = require('pg').Pool;
const pool = new Pool({
	user: process.env.DB_USER,
	host: '34.205.72.180',
	database: 'reports',
	password: process.env.DB_PASS,
	port: 5432,
});

var format = require('pg-format');

const getReports = (strategies) => {
	return new Promise(function(resolve, reject) {
		if(!strategies?.length) {
			resolve([]);
		} else {

			const query = format(
				'SELECT * FROM reports WHERE strategy_address IN (%L) ORDER BY block DESC LIMIT 100', 
				strategies
			);

			pool.query(query, (error, results) => {
				if (error) {
					reject(error);
				} else {
					resolve(results.rows);
				}
			});
		}
	}); 
};
module.exports = {
	getReports,
};