exports.seed = function (knex) {
  return knex('products')
    .del()
    .then(function () {
      return knex('products').insert([
        { id: 1, category_id: 1, name: 'Economy Veg-Tan Leather', price: 59.99, stock: 100, description: 'High-quality veg-tanned leather.' },
        { id: 2, category_id: 2, name: 'Leather Awl Set', price: 19.99, stock: 50, description: 'Perfect tools for stitching leather.' },
        { id: 3, category_id: 3, name: 'Leather Shoe Mold', price: 89.99, stock: 30, description: 'Mold for shaping leather shoes.' },
      ]);
    });
};