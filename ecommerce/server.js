const express = require('express');
const knex = require('knex');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const { authenticate } = require("./authorization/authMiddleware.js");



dotenv.config();

const knexConfig = require('./knexfile.js')[process.env.NODE_ENV || 'development'];
const db = knex(knexConfig);
const jwt = require("jsonwebtoken");


const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.get('/users', async (req, res) => {
  try {
    const users = await db('users').select('id', 'username', 'email', 'password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

  
  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await db('users').where({ email }).first();
      if (!user) {
        console.error("User not found for email:", email);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.error("Invalid password for email:", email);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      console.log("Generated JWT Token:", token);
  
      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.error('Error during login:', error.message);
      res.status(500).json({ error: 'Failed to log in.' });
    }
  });


app.post('/register', async (req, res) => {
  const { username, email, password, address } = req.body;

  try {
    const existingUser = await db('users').where({ email }).orWhere({ username }).first();
    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [userId] = await db('users').insert({ username, email, password: hashedPassword });

    if (address) {
      await db('addresses').insert({
        user_id: userId,
        street: address.street,
        city: address.city,
        state: address.state,
        zip: address.postal_code,
        country: address.country,
      });
    }

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Failed to register user.' });
  }
});

app.get('/account', authenticate, async (req, res) => {
    console.log("Authenticated userId:", req.userId);
  
    try {
      const user = await db('users')
        .where({ id: req.userId })
        .select('username', 'email')
        .first();
  
      const address = await db('addresses')
        .where({ user_id: req.userId })
        .select('street', 'city', 'state', 'zip', 'country')
        .first();
  
        const orders = await db('orders')
        .where({ user_id: req.userId })
        .select('id', 'total_price as total');
  
      if (user) {
        res.status(200).json({
          user: {
            ...user,
            address: address
              ? `${address.street}, ${address.city}, ${address.state}, ${address.zip}, ${address.country}`
              : null,
          },
          orders,
        });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Failed to fetch account data:', error.message);
      res.status(500).json({ error: 'Failed to fetch account data.' });
    }
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
  const { userId } = req.params;
  if (req.userId !== Number(userId)) {
    return res.status(403).json({ error: 'Unauthorized access' });
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