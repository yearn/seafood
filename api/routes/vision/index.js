const axios = require('axios');
const dayjs = require('dayjs');
const express = require('express');
const tvlsQuery = require('./tvls.json');

const router = express.Router();

const networkLabels = {
  ETH: 1,
  FTM: 250,
  OPT: 10,
  ARRB: 42161
};

router.get('/tvls', function(req, res, next) {
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

	axios({
		method: 'post',
		headers: {
			['Accept']: 'application/json',
			['Content-Type']: 'application/json'
		},
		url: 'https://staging.yearn.vision/api/ds/query',
		data: query
	}).then(response => {
		if(response.data.error) {
			res.status(500).send(response.data.error);
		} else {
			const result = Object.keys(networkLabels)
				.map(key => networkLabels[key])
				.reduce((o, id) => ({ ...o, [id]: {}}), {});

			for(const r in response.data.results) {
				for(const frame of response.data.results[r].frames) {
					if(frame.schema.fields[1].labels.address !== 'n/a') {
						const chainId = networkLabels[frame.schema.fields[1].labels.network];
						result[chainId][frame.schema.fields[1].labels.address] = {
							dates: frame.data.values[0],
							tvls: frame.data.values[1]
						};
					}
				}
			}

			res.status(200).send(result);
		}
	});
});

module.exports = router;