require('dotenv').config();
const axios = require('axios');
const tvlsQuery = require('../api/routes/vision/tvls.json');
const dayjs = require('dayjs');

const networkLabels = {
  ETH: 1,
  FTM: 250,
  OPTI: 10,
  ARRB: 42161
}

async function main() {
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;
  const week = 7 * day;
  const from = now - 2 * week - 1 * hour;

  const query = {
    ...tvlsQuery,
    from: (from).toString(),
    to: (now).toString(),
    range: {
      ...tvlsQuery.range,
      from: dayjs(new Date(from)).toISOString(),
      to: dayjs(new Date(now)).toISOString()
    }
  };

  try {
    const response = await axios({
      method: 'post',
      headers: {
        ['Accept']: 'application/json',
        ['Content-Type']: 'application/json'
      },
      url: 'https://yearn.vision/api/ds/query',
      data: query
    })

    const result = Object.keys(networkLabels)
      .map(key => networkLabels[key])
      .reduce((o, id) => ({ ...o, [id]: {}}), {});

    for(const r in response.data.results) {
      for(const frame of response.data.results[r].frames) {
        if(frame.schema.fields.length > 0 && frame.schema.fields[1].labels.address !== 'n/a') {
          const chainId = networkLabels[frame.schema.fields[1].labels.network];
          result[chainId][frame.schema.fields[1].labels.address] = frame.data.values;
        }
      }
    }

    console.log('result', result);
    console.log('👋 All done');
  } catch(error) {
    console.log('🛑', error.response?.data || error);
  }
}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});