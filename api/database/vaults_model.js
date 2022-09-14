const Pool = require('pg').Pool;
const pool = new Pool({
	user: process.env.DB_USER,
	host: '34.205.72.180',
	database: 'reports',
	password: process.env.DB_PASS,
	port: 5432,
});
var format = require('pg-format');

const getVaults = (id) => {
	return new Promise(function(resolve, reject) {
		const query = format('SELECT * FROM vaults WHERE chain = %L', id);
		pool.query(query, (error, results) => {
			if (error) {
				console.error(error);
				reject(error);
			} else if(results.rows) {
				resolve(results.rows);
			} else {
				resolve([]);
			}
		});
	}); 
};

// const deleteVaults = (vaults) => {
// 	console.log(vaults);
// 	const formated_vaults = vaults.map(v =>{ return v.address;});
// 	const text = format('DELETE FROM vaults WHERE address in (%L)', formated_vaults);

// 	return new Promise(function(resolve, reject) {
// 		pool.query(text, (error, results) => {
// 			if (error) {
// 				reject(text);
// 			}
			
// 			resolve();
// 		});
// 	});
// };

// const updateVaults = (vaults) => {
// 	console.log(vaults);
// 	const formated_vaults = vaults.map(v =>{ return [v.address, v.name, v.want, v.chain, v.version];});
// 	const text = format('INSERT INTO vaults(address, name, want, chain, version) VALUES %L', formated_vaults);

// 	return new Promise(function(resolve, reject) {
// 		pool.query(text, (error, results) => {
// 			if (error) {
// 				reject(error);
// 			}
			
// 			resolve();
// 		});
// 	});
// };

module.exports = {
	getVaults
};