const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use('/', routes);

const PORT = 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
