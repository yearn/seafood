const Pool = require('pg').Pool;
const pool = new Pool({
	user: 'wavey',
	host: '34.205.72.180',
	database: 'reports',
	password: 'wavey',
	port: 5432,
});

const getReports = () => {
	return new Promise(function(resolve, reject) {
		pool.query('SELECT * FROM reports LIMIT 100', (error, results) => {
			if (error) {
				reject(error);
			}
			console.log(results);
			resolve(results.rows);
		});
	}); 
};
module.exports = {
	getReports,
};