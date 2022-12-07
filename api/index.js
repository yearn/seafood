const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
const getVaultsRouter = require('./routes/getVaults');
const githubRouter = require('./routes/github');
const visionRouter = require('./routes/vision');
const tenderlyRouter = require('./routes/tenderly');
const abiRouter = require('./routes/abi');

app.use('/api/getVaults', getVaultsRouter);
app.use('/api/github', githubRouter);
app.use('/api/vision', visionRouter);
app.use('/api/tenderly', tenderlyRouter);
app.use('/api/abi', abiRouter);

const port = process.env.PORT || 9000;
app.listen(port, () => console.log(`Server running on ${port}, http://localhost:${port}`));