const Pool = require('pg').Pool;
const pool = new Pool({
	user: process.env.REACT_APP_DB_USER,
	host: '34.205.72.180',
	database: 'reports',
	password: process.env.REACT_APP_DB_PASS,
	port: 5432,
});

var format = require('pg-format');

const getReports = (options) => {
	return new Promise(function(resolve, reject) {
		if(!options.strategies?.length) {
			resolve([]);
		} else {

			const query = format(
				'SELECT * FROM reports WHERE chain_id = %L AND strategy_address IN (%L) ORDER BY block DESC', 
				options.chainId, options.strategies
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