exports.seed = async function (knex) {
  await knex('order_items').del();

  await knex('order_items').insert([
    {
      id: 1,
      order_id: 1,
      product_id: 1,
      quantity: 2,
      price: 19.99,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      id: 2,
      order_id: 1,
      product_id: 2,
      quantity: 1,
      price: 59.99,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      id: 3,
      order_id: 2,
      product_id: 3,
      quantity: 1,
      price: 49.99,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      id: 4,
      order_id: 3,
      product_id: 4,
      quantity: 3,
      price: 50.00,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ]);
};
