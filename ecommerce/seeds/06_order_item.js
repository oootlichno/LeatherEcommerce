exports.seed = function (knex) {
  return knex('order_items')
    .del()
    .then(function () {
      return knex('order_items').insert([
        { id: 1, order_id: 1, product_id: 1, quantity: 1, price: 59.99 },
        { id: 2, order_id: 1, product_id: 2, quantity: 1, price: 19.99 },
        { id: 3, order_id: 2, product_id: 3, quantity: 2, price: 89.99 },
      ]);
    });
};