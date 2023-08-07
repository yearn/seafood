const axios = require('axios');

async function fetchAbi(chainId, contract) {
  const api = `${process.env[`EXPLORER_API_FOR_${chainId}`]}/api`;
  const response = await axios.get(api, {
    headers: {
      ['Accept']: 'application/json'
    },
    params: {
      module: 'contract',
      action: 'getabi',
      address: contract
    }
  });
  return JSON.parse(response.data.result);
}

module.exports = fetchAbi;
