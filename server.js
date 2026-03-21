// server.js
require('dotenv').config();
const app = require('./app'); // your existing app

const PORT = process.env.PORT || 5000;

require('events').EventEmitter.defaultMaxListeners = 15;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});