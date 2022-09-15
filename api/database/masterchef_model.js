const Pool = require('pg').Pool;
const pool = new Pool({
	user: process.env.REACT_APP_DB_USER,
	host: '34.205.72.180',
	database: 'reports',
	password: process.env.REACT_APP_DB_PASS,
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
			resolve(results.rows);
		});
	}); 
};

module.exports = {
	getChefs
};