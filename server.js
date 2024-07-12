const express = require('express');
const maxmind = require('maxmind');
const path = require('path');
const geoip = require('geoip-lite'); // For getting client IP

const app = express();
const port = process.env.PORT || 3000;

// Load the MaxMind database
const dbPath = path.join(__dirname, 'GeoLite2-Country.mmdb');
let lookup;

maxmind.open(dbPath, (err, db) => {
  if (err) {
    console.error('Error loading MaxMind database:', err);
  } else {
    lookup = db;
    console.log('MaxMind database loaded successfully');
  }
});

// Middleware to get client IP address
const getClientIp = (req) => {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
};

// Root route handler
app.get('/', (req, res) => {
  // Get client IP
  const clientIp = getClientIp(req);

  // Use MaxMind database to get country information
  const result = lookup.get(clientIp);

  // Prepare response
  let response = {
    ip: clientIp,
    game: result ? result.country.names.en : 'Unknown',
    countryCode: result ? result.country.iso_code : 'Unknown'
  };

  res.json(response);
});

// Start the server
app.listen(port, () => {
  console.log(`GeoIP API listening at http://localhost:${port}`);
});
