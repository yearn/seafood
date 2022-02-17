const Pool = require('pg').Pool;
const pool = new Pool({
	user: 'wavey',
	host: '34.205.72.180',
	database: 'reports',
	password: 'wavey',
	port: 5432,
});
var format = require('pg-format');

const getVaults = (id) => {
	return new Promise(function(resolve, reject) {
		//resolve(id);
		//pool.query('SELECT * FROM vaults WHERE chain = $1', id, (error, results) => {
		const text = format('SELECT * FROM vaults WHERE chain = %L', id);
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

const deleteVaults = (vaults) => {
	console.log(vaults);
	const formated_vaults = vaults.map(v =>{ return v.address;});
	const text = format('DELETE FROM vaults WHERE address in (%L)', formated_vaults);

	return new Promise(function(resolve, reject) {
		pool.query(text, (error, results) => {
			if (error) {
				reject(text);
			}
			
			resolve();
		});
	});
};

const updateVaults = (vaults) => {
	console.log(vaults);
	const formated_vaults = vaults.map(v =>{ return [v.address, v.name, v.want, v.chain, v.version];});
	const text = format('INSERT INTO vaults(address, name, want, chain, version) VALUES %L', formated_vaults);

	return new Promise(function(resolve, reject) {
		pool.query(text, (error, results) => {
			if (error) {
				reject(error);
			}
			
			resolve();
		});
	});
    
	/*
	new Promise(function(resolve, reject) {
        const sql
       
		pool.query('INSERT INTO vaults (address, want, chain, version) SELECT  
        VALUES (value1, value2, value3, ...)', (error, results) => {
			if (error) {
				reject(error);
			}
			console.log(results);
			resolve(results.rows);
		});
	});*/
};
module.exports = {
	getVaults, updateVaults, deleteVaults
};