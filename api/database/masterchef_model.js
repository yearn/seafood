const Pool = require('pg').Pool;
const pool = new Pool({
	user: 'wavey',
	host: '34.205.72.180',
	database: 'reports',
	password: 'wavey',
	port: 5432,
});
var format = require('pg-format');

const getChefs = (id) => {
	return new Promise(function(resolve, reject) {
		//resolve(id);
		//pool.query('SELECT * FROM vaults WHERE chain = $1', id, (error, results) => {
		const text = format('SELECT * FROM masterchefs WHERE chain = %L', id);
		// resolve(text);
		pool.query(text, (error, results) => {
			if (error) {
				reject(error);
			}
			console.log(results);
			resolve(results.rows);
		});
	}); 
};

module.exports = {
	getChefs
};