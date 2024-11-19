/* const express = require('express');
const knex = require('knex');
const cors = require('cors');
const dotenv = require('dotenv');
const { authenticate } = require("./authorization/authRoutes.js");


dotenv.config();

const knexConfig = require('./knexfile.js')[process.env.NODE_ENV || 'development'];
const db = knex(knexConfig);

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db('categories').select('*');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
});

app.get('/api/products', async (req, res) => {
  const { categoryId } = req.query;
  try {
    const products = categoryId
      ? await db('products').where({ category_id: categoryId }).select('*')
      : await db('products').select('*');
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const product = await db('products').where({ id }).first();
      if (product) {
        res.status(200).json(product);
      } else {
        res.status(404).json({ error: `Product with ID ${id} not found` });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to retrieve product' });
    }
  });

app.post('/api/users', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const [id] = await db('users').insert({ username, email, password });
    res.status(201).json({ id, username, email });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { userId, items } = req.body;
  try {
    const [orderId] = await db('orders').insert({
      user_id: userId,
      status: 'Processing',
      total_price: items.reduce((total, item) => total + item.price * item.quantity, 0),
    });

    const orderItems = items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      quantity: item.quantity,
    }));

    await db('order_items').insert(orderItems);

    res.status(201).json({ orderId, status: 'Processing', items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.get('/api/orders/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await db('orders').where({ user_id: userId }).select('*');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); */

const express = require('express');
const knex = require('knex');
const cors = require('cors');
const dotenv = require('dotenv');
const { authenticate } = require("./authorization/authRoutes.js");

dotenv.config();

const knexConfig = require('./knexfile.js')[process.env.NODE_ENV || 'development'];
const db = knex(knexConfig);

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db('categories').select('*');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
});

app.get('/api/products', async (req, res) => {
  const { categoryId } = req.query;
  try {
    const products = categoryId
      ? await db('products').where({ category_id: categoryId }).select('*')
      : await db('products').select('*');
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const product = await db('products').where({ id }).first();
      if (product) {
        res.status(200).json(product);
      } else {
        res.status(404).json({ error: `Product with ID ${id} not found` });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to retrieve product' });
    }
  });

app.post('/api/users', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const [id] = await db('users').insert({ username, email, password });
    res.status(201).json({ id, username, email });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { userId, items } = req.body;
  try {
    const [orderId] = await db('orders').insert({
      user_id: userId,
      status: 'Processing',
      total_price: items.reduce((total, item) => total + item.price * item.quantity, 0),
    });

    const orderItems = items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      quantity: item.quantity,
    }));

    await db('order_items').insert(orderItems);

    res.status(201).json({ orderId, status: 'Processing', items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.get('/api/orders/:userId', authenticate, async (req, res) => {
  // Updated route to use authentication
  const { userId } = req.params;
  if (req.userId !== Number(userId)) {
    return res.status(403).json({ error: "Unauthorized access" });
  }
  try {
    const orders = await db('orders').where({ user_id: req.userId }).select('*');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});