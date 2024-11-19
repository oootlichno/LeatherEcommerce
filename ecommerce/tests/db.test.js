const { db, resetDatabase } = require('./dbSetup');

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await db.destroy();
});

describe('Database Tests', () => {
    test('Users table: Should fetch all users', async () => {
        const users = await db('users');
        expect(users).toHaveLength(3); 
        expect(users[0]).toHaveProperty('username', 'john_doe'); 
      });

  test('Addresses table: Should fetch addresses linked to users', async () => {
    const addresses = await db('addresses').where({ user_id: 1 });
    expect(addresses).toHaveLength(1);
    expect(addresses[0]).toHaveProperty('city', 'Katy');
  });

  test('Categories table: Should fetch all categories', async () => {
    const categories = await db('categories');
    expect(categories).toHaveLength(3);
    expect(categories[0]).toHaveProperty('name', 'Leather');
  });

  test('Products table: Should fetch products linked to a category', async () => {
    const products = await db('products').where({ category_id: 1 });
    expect(products).toHaveLength(2);
    expect(products[0]).toHaveProperty('name', 'Cowhide Leather');
  });

  test('Orders table: Should fetch orders for a specific user', async () => {
    const orders = await db('orders').where({ user_id: 1 });
    expect(orders).toHaveLength(1);
    expect(orders[0]).toHaveProperty('status', 'Processing');
  });

  test('Order Items table: Should fetch items for an order', async () => {
    const orderItems = await db('order_items').where({ order_id: 1 });
    expect(orderItems).toHaveLength(2);
    expect(orderItems[0]).toHaveProperty('product_id', 1);
  });
});