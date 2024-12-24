const fs = require('fs');
const https = require('https');
const express = require('express');
const selfsigned = require('selfsigned');

const app = express();

// Generate self-signed certificate and key
const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = selfsigned.generate(attrs, { days: 365 });

// Save the key and certificate locally (optional)
// fs.writeFileSync('key.pem', pems.private);
// fs.writeFileSync('cert.pem', pems.cert);

const PORT = 443;

// Serve static files
app.use(express.static('public'));

// Create HTTPS server
https.createServer({ key: pems.private, cert: pems.cert }, app).listen(PORT, () => {
  console.log(`Server is running at https://localhost:${PORT}`);
});
