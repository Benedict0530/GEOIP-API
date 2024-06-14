const express = require('express');
const maxmind = require('maxmind');
const path = require('path');

const app = express();
const port = 3000;

// Load the MaxMind database
const dbPath = path.join(__dirname, 'GeoLite2-Country.mmdb');
let lookup;

maxmind.open(dbPath)
  .then(db => {
    lookup = db;
    console.log('MaxMind database loaded');
  })
  .catch(err => {
    console.error('Error loading MaxMind database:', err);
  });

// Define the GeoIP endpoint
app.get('/geoip/:ip', (req, res) => {
  const ip = req.params.ip;
  if (!lookup) {
    return res.status(500).send({ error: 'GeoIP database not loaded yet' });
  }

  const result = lookup.get(ip);

  if (result) {
    res.send({
      ip: ip,
      country: result.country.names.en,
      countryCode: result.country.iso_code
    });
  } else {
    res.status(404).send({ error: 'IP address not found in the database' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`GeoIP API listening at http://localhost:${port}`);
});
