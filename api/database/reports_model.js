const Pool = require('pg').Pool;
const pool = new Pool({
	user: 'postgres',
	host: '45.33.14.239',
	database: 'my_database',
	password: 'pass',
	port: 5432,
});

const getReports = () => {
	return new Promise(function(resolve, reject) {
		pool.query('SELECT * FROM reports', (error, results) => {
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