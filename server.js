const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const fieldIntel = require('./server/fieldIntel');

app.get('/api/field-intel', fieldIntel.handleFieldIntel);
app.get('/api/health', fieldIntel.handleHealth);

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`GeoIndex running on port ${PORT}`);
  if (process.env.FIELD_INTEL !== 'off') fieldIntel.start();
});
