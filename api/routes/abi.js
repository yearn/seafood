const axios = require('axios');
const express = require('express');
const config = require('../../src/config.json');

const router = express.Router();
const cache = {};

router.get('/', function(req, res, next) {
  const key = `${req.query.chainId}/${req.query.contract}`
  if(cache[key]) {
    res.status(200).send(cache[key]);
  } else {
    const chain = config.chains.find(chain => chain.id === parseInt(req.query.chainId));
    if(!chain) {
      res.status(500).send(`Invalid chain id ${req.query.chainId}`); return;
    } else {
      const url = `${chain.explorerApi}/api?module=contract&action=getabi&address=${req.query.contract}`;
      axios({
        method: 'get',
        headers: {
          ['Accept']: 'application/json'
        },
        url
      }).then(response => {
        if(response.data.error) {
          res.status(500).send(response.data.error); return;
        } else {
          if(response.data.status === "1") {
            cache[key] = response.data.result;
            res.status(200).send(cache[key]);
          } else {
            res.status(500).send(response.data); return;
          }
        }
      });
    }
  }
});

module.exports = router;
