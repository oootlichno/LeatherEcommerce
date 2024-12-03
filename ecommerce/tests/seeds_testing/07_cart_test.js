exports.seed = function (knex) {
  return knex('cart')
    .del() 
    .then(() => {
      return knex('cart').insert([
        {
          user_id: 1,
          product_id: 1,
          price: 59.99, 
          quantity: 2,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          user_id: 1,
          product_id: 2,
          price: 19.99,
          quantity: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          user_id: 2,
          product_id: 3,
          price: 89.99, 
          quantity: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
    });
};
