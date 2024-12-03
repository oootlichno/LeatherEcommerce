const request = require('supertest');
const app = require('../server'); 
const { resetDatabase } = require('../tests/helpers');

beforeAll(async () => {
  await resetDatabase(); 
});

afterAll(async () => {
  const knex = require('../tests/dbSetup_test'); 
  await knex.destroy(); 
});

describe('API Tests', () => {
  /**
   * Categories Endpoints
   */
  describe('GET /products/categories', () => {
    it('Should fetch all categories', async () => {
      const res = await request(app).get('/products/categories');
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /products/categories/:id', () => {
    it('Should fetch a category by ID', async () => {
      const res = await request(app).get('/products/categories/1');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', 1);
      expect(res.body).toHaveProperty('name');
    });

    it('Should return 404 if category not found', async () => {
      const res = await request(app).get('/products/categories/999');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  /**
   * Products Endpoints
   */
  describe('GET /products', () => {
    it('Should fetch all products', async () => {
      const res = await request(app).get('/products');
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('Should fetch products by category ID', async () => {
      const res = await request(app).get('/products?categoryId=1');
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      res.body.forEach((product) => {
        expect(product).toHaveProperty('category_id', 1);
      });
    });
  });

  describe('GET /products/:id', () => {
    it('Should fetch a product by ID', async () => {
      const res = await request(app).get('/products/1');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', 1);
      expect(res.body).toHaveProperty('name');
    });

    it('Should return 404 if product not found', async () => {
      const res = await request(app).get('/products/999');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  /**
   * Auth Endpoints
   */
  describe('POST /register', () => {
    it('Should register a new user', async () => {
      const res = await request(app).post('/register').send({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zip: '12345',
          country: 'Testland',
        },
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'User registered successfully!');
    });

    it('Should not register a user with duplicate email', async () => {
      const res = await request(app).post('/register').send({
        username: 'duplicateuser',
        email: 'newuser@example.com', // Same email
        password: 'password123',
        name: 'Duplicate User',
      });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Email or username already exists.');
    });
  });

  describe('POST /login', () => {
    it('Should log in an existing user', async () => {
      const res = await request(app).post('/login').send({
        email: 'newuser@example.com',
        password: 'password123',
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Login successful');
      expect(res.body).toHaveProperty('token');
    });

    it('Should not log in with incorrect credentials', async () => {
      const res = await request(app).post('/login').send({
        email: 'newuser@example.com',
        password: 'wrongpassword',
      });
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  /**
   * Cart Endpoints
   */
  describe('Cart Endpoints', () => {
    let token;

    beforeAll(async () => {
      const res = await request(app).post('/login').send({
        email: 'newuser@example.com',
        password: 'password123',
      });
      token = res.body.token;
    });

/*     it('Should fetch cart items for a user', async () => {
      const res = await request(app).get('/cart').set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.cart).toBeInstanceOf(Array);
    }); */

    it('Should add an item to the cart', async () => {
      const res = await request(app).post('/cart').set('Authorization', `Bearer ${token}`).send({
        productId: 1,
        price: 59.99,
        quantity: 2,
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Cart updated successfully');
    });

    it('Should clear the cart', async () => {
      const res = await request(app).delete('/cart').set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Cart cleared successfully');
    });
  });
});