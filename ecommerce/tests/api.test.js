const request = require('supertest');
const app = require('../../server'); 
describe('API Tests', () => {
  test('GET /api/categories - Fetch all categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
  });

  // Test: Fetch all products
  test('GET /api/products - Fetch all products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('price');
  });

  // Test: Fetch products by category
  test('GET /api/products?categoryId=1 - Fetch products by category', async () => {
    const categoryId = 1;
    const res = await request(app).get(`/api/products?categoryId=${categoryId}`);
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    res.body.forEach(product => {
      expect(product).toHaveProperty('category_id', categoryId);
    });
  });

  // Test: Add a new user
  test('POST /api/users - Add a new user', async () => {
    const newUser = {
      username: 'test_user',
      email: 'test_user@example.com',
      password: 'password123',
    };
    const res = await request(app).post('/api/users').send(newUser);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('username', 'test_user');
    expect(res.body).toHaveProperty('email', 'test_user@example.com');
  });

  // Test: Create a new order
  test('POST /api/orders - Create a new order', async () => {
    const newOrder = {
      userId: 1,
      totalPrice: 99.98,
      items: [
        { productId: 1, quantity: 2 },
        { productId: 3, quantity: 1 },
      ],
    };
    const res = await request(app).post('/api/orders').send(newOrder);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('items');
    expect(res.body.items).toBeInstanceOf(Array);
  });

  // Test: Fetch order history for a user
  test('GET /api/orders/:userId - Fetch order history for a user', async () => {
    const userId = 1;
    const res = await request(app).get(`/api/orders/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    res.body.forEach(order => {
      expect(order).toHaveProperty('user_id', userId);
    });
  });
});