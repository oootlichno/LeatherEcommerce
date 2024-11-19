exports.seed = function (knex) {
  return knex('orders')
    .del()
    .then(function () {
      return knex('orders').insert([
        { id: 1, user_id: 1, total_price: 79.98, order_date: knex.fn.now(), status: 'Processing' },
        { id: 2, user_id: 2, total_price: 159.97, order_date: knex.fn.now(), status: 'Shipped' },
      ]);
    });
};
