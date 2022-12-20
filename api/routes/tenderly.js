const axios = require('axios');
const express = require('express');

const router = express.Router();

router.post('/fork', async function(req, res, next) {
  try {
    const result = await axios({
      method: 'post',
      headers: {
        'X-Access-Key': process.env.TENDERLY_ACCESS_TOKEN
      },
      url: process.env.TENDERLY_FORK_API,
      data: {
        network_id: req.body.network_id,
        block_number: req.body.block_number
      }
    });
    res.status(200).send({id: result.data.simulation_fork.id});
  } catch(error) {
    console.log('error', error);
    res.status(500).send('An error occurred creating a fork on Tenderly.');
  }

});

module.exports = router;