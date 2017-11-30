// const fs = require('fs');
// const https = require('https');
const express = require('express');
const path = require('path');

// const pfx = fs.readFileSync(path.join(__dirname, 'localhost.pfx'));
// const credentials = { pfx, passphrase: 'abc' };
const staticPath = path.join(__dirname, '../../../dist');

const app = express();

app.use('/', express.static(staticPath));

// https.createServer(credentials, app).listen(1980);

app.listen(1980, () => console.log('Listening on port 1980'));
