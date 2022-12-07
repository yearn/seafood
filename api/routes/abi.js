const axios = require('axios');
const express = require('express');

const router = express.Router();
const cache = {};

router.get('/', function(req, res, next) {
  const key = `${req.query.chainId}/${req.query.contract}`
  if(cache[key]) {
    console.log(key, 'use cache');
    res.status(200).send(cache[key]);
  } else {
    const api = `${process.env[`EXPLORER_API_FOR_${req.query.chainId}`]}/api`;
    axios.get(api, {
      headers: {
        ['Accept']: 'application/json'
      },
      params: {
        module: 'contract',
        action: 'getabi',
        address: req.query.contract,
        apikey: process.env[`EXPLORER_API_KEY_FOR_${req.query.chainId}`]
      }
    }).then(response => {
      if(response.data.error) {
        console.error(response.data.error);
        res.status(500).send(response.data.error); return;
      } else {
        if(response.data.status === "1") {
          cache[key] = response.data.result;
          res.status(200).send(cache[key]);
        } else {
          console.error(response.data);
          res.status(500).send(response.data); return;
        }
      }
    });
  }
});

module.exports = router;
