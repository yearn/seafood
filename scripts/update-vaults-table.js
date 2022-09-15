require('dotenv').config();
const {ethers} = require('ethers');
const config = require('../src/config');
const registryAbi = require('./abi/registry.json');
const vault043Abi = require('./abi/vault043.json');

const prompt = require('prompt');
prompt.message = '';
prompt.delimiter = '';
prompt.start();

const format = require('pg-format');
const Pool = require('pg').Pool;
const pool = new Pool({
	user: process.env.DB_USER,
	host: '34.205.72.180',
	database: 'reports',
	password: process.env.DB_PASS,
	port: 5432,
});

async function getVaults() {
  return (await pool.query('select * from vaults')).rows;
}

async function insertVault(vault) {
  const insert = format(
    'insert into vaults(address, name, want, chain, version) values (%L)', 
    [vault.address, vault.name, vault.want, vault.chain, vault.version]);
  await pool.query(insert);
}

async function main() {
  const newVaults = [];
  const currentVaults = await getVaults();

  console.log();
  console.log('look for new vaults..');
  console.log();

  for(const chain of config.chains) {
    const provider = new ethers.providers.JsonRpcProvider(chain.providers[0]);
    const registry = new ethers.Contract(chain.registry, registryAbi, provider);
    const numTokens = await registry.numTokens();
    console.log('chain', chain.id, chain.name, '- searching', numTokens.toNumber(), 'tokens..');
    for(let i = 0; i < numTokens; i++) {
      const token = await registry.tokens(i);
      console.log('token', token);
      for(let j = 0; j < 20; j++) {
        const vaultAddress = await registry.vaults(token, j);
        if(vaultAddress === ethers.constants.AddressZero) break;
        if(currentVaults.find(v => v.address === vaultAddress && v.chain === chain.id)) break;
        const vault = new ethers.Contract(vaultAddress, vault043Abi, provider);
        const name = await vault.name();
        const version = await vault.apiVersion();
        newVaults.push({
          address: vaultAddress,
          name: name,
          want: token,
          version: version,
          chain: chain.id
        });
      }
    }
  }

  console.log();
  console.log(newVaults.length, 'new vaults found');
  newVaults.map(vault => console.log(vault.address, vault.name, vault.version, 'chain', vault.chain));
  console.log();

  if(newVaults.length) {
    const proceed = await prompt.get({
      name: 'proceed',
      description: 'Adds these vaults to the Vaults table? (Y/n)',
      pattern: /^[YyNn]$/,
      default: 'Y',
      required: true
    })

    if(/^[Yy]$/.test(proceed.proceed)) {
      for(const vault of newVaults) {
        console.log('insert', vault.address, vault.name, vault.version, 'chain', vault.chain)
        await insertVault(vault);
      }
    }
  }

  console.log('👋 All done');
}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});