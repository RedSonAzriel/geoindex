const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const fieldIntel = require('./server/fieldIntel');
const security = require('./server/security');

app.disable('x-powered-by');
app.set('trust proxy', 1); // Heroku sits behind one proxy
app.use(security.httpsRedirect);
app.use(security.headers);

app.use('/api', security.rateLimit({ windowMs: 60000, max: 120 }));
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
