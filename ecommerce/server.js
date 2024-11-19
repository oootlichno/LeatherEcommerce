
const express = require('express');
const knex = require('knex');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const knexConfig = require('./knexfile.js')[process.env.NODE_ENV || 'development'];

const db = knex(knexConfig);

const app = express();

app.use(cors());
app.use(express.json()); 

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await db('products').select('*');
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});