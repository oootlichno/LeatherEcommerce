const knex = require('../tests/dbSetup_test');
const { resetDatabase } = require('../tests/helpers');

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await knex.destroy();
});

describe('Database Tests', () => {
  describe('Users Table', () => {
    test('Should fetch all users and validate their structure', async () => {
      const users = await knex('users');
      expect(users).toHaveLength(3);
      expect(users[0]).toHaveProperty('username');
      expect(users[0]).toHaveProperty('email');
      expect(users[0]).toHaveProperty('password');
    });

    test('Should fetch a user by ID', async () => {
      const user = await knex('users').where({ id: 1 }).first();
      expect(user).toBeDefined();
      expect(user).toHaveProperty('username', 'john_doe');
      expect(user).toHaveProperty('email', 'john@example.com');
      expect(user).toHaveProperty('name', 'John Doe');
    });
  });

  describe('Orders Table', () => {
    test('Should fetch all orders for a specific user', async () => {
      const orders = await knex('orders').where({ user_id: 1 });
      expect(orders).toHaveLength(2);
      expect(orders[0]).toHaveProperty('status');
      expect(orders[0]).toHaveProperty('total_price');
    });

    test('Should validate foreign key relationships in orders table', async () => {
      const orders = await knex('orders').where({ user_id: 2 });
      expect(orders).toHaveLength(1);
      const user = await knex('users').where({ id: orders[0].user_id }).first();
      expect(user).toBeDefined();
      expect(user).toHaveProperty('username', 'jane_doe');
    });
  });

  describe('Order Items Table', () => {
    test('Should fetch all items for a specific order', async () => {
      const orderItems = await knex('order_items').where({ order_id: 1 });
      expect(orderItems).toHaveLength(2);
      expect(orderItems[0]).toHaveProperty('product_id');
      expect(orderItems[0]).toHaveProperty('quantity');
    });

    test('Should validate foreign key relationships in order_items table', async () => {
      const orderItems = await knex('order_items').where({ order_id: 1 });
      const product = await knex('products').where({ id: orderItems[0].product_id }).first();
      expect(product).toBeDefined();
      expect(product).toHaveProperty('name');
    });

    test('Should validate order total price matches the sum of order items', async () => {
      const order = await knex('orders').where({ id: 1 }).first();
      const orderItems = await knex('order_items').where({ order_id: 1 });
    
      const calculatedTotal = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    
      const roundedTotal = Math.round(calculatedTotal * 100) / 100;
    
      expect(order.total_price).toBeCloseTo(roundedTotal, 1);
    });
  });

  describe('Data Integrity Tests', () => {
    test('Should prevent duplicate users by username or email', async () => {
      await expect(
        knex('users').insert({
          username: 'john_doe',
          email: 'john@example.com',
          password: 'hashed_password',
        })
      ).rejects.toThrow();
    });

    test('Should enforce non-null constraints on required fields', async () => {
      await expect(
        knex('orders').insert({
          user_id: null,
          total_price: 100.0,
          status: 'pending',
        })
      ).rejects.toThrow();
    });
  });
});

