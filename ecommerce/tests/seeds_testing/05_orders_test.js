exports.seed = async function (knex) {
  await knex('orders').del();

  await knex('orders').insert([
    {
      id: 1,
      user_id: 1,
      status: 'pending',
      total_price: 99.98,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      id: 2,
      user_id: 2,
      status: 'completed',
      total_price: 49.99,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      id: 3,
      user_id: 1,
      status: 'shipped',
      total_price: 150.00,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ]);
};
