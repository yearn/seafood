const express = require('express');
const fetchAbi = require('./fetchAbi');

const router = express.Router();

router.get('/', async function(req, res) {
  const {chainId, contract} = req.query;
  if(!chainId) res.status(400).send('!chainId');
  if(!contract) res.status(400).send('!contract');

  try {
    const abi = await fetchAbi(chainId, contract);
    res.status(200).send(abi);
  } catch(error) {
    console.error(error);
    res.status(500).send(error);
  }
});

module.exports = router;
