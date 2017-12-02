
const express = require('express');
const path = require('path');

const staticPath = path.join(__dirname, '../../../dist');

const app = express();

app.use('/', express.static(staticPath));

app.listen(1980, () => console.log('App server listening on port 1980'));
