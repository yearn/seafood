const Pool = require('pg').Pool;

if(!process.env.DB_HOST) console.error('!DB_HOST')
if(!process.env.DB_USER) console.error('!DB_USER')
if(!process.env.DB_PASS) console.error('!DB_PASS')

const pool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: 'reports',
	password: process.env.DB_PASS,
	port: 5432,
});

const format = require('pg-format');

const getReports = (options) => {
	return new Promise(function(resolve, reject) {
		if(!options.strategies?.length) {
			resolve([]);
			return;
		}

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
	}); 
};
module.exports = {
	getReports,
};