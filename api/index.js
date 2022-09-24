const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
var getVaultsRouter = require('./routes/getVaults');
var githubRouter = require('./routes/github');

app.use('/api/getVaults', getVaultsRouter);
app.use('/api/github', githubRouter);

app.get('/api/', (req, res) => res.send('Home Page Route'));

app.get('/api/about', (req, res) => res.send('About Page Route'));

app.get('/api/portfolio', (req, res) => res.send('Portfolio Page Route'));

app.get('/api/testAPI', (req, res) => res.send('Contact Page Route'));

const port = process.env.PORT || 9000;

app.listen(port, () => console.log(`Server running on ${port}, http://localhost:${port}`));