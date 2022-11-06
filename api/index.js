const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
const getVaultsRouter = require('./routes/getVaults');
const githubRouter = require('./routes/github');
const visionRouter = require('./routes/vision');

app.use('/api/getVaults', getVaultsRouter);
app.use('/api/github', githubRouter);
app.use('/api/vision', visionRouter);

const port = process.env.PORT || 9000;
app.listen(port, () => console.log(`Server running on ${port}, http://localhost:${port}`));