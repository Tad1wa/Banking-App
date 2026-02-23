const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;


app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/accounts');
const servicesRoutes = require('./routes/services');

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/services', servicesRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'PrimePay API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});