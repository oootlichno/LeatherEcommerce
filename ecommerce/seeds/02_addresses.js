exports.seed = function (knex) {
  return knex('addresses')
    .del()
    .then(function () {
      return knex('addresses').insert([
        { id: 1, user_id: 1, street: '123 Main St', city: 'Katy', state: 'TX', zip: '77494', country: 'USA' },
        { id: 2, user_id: 2, street: '456 Oak Ave', city: 'Austin', state: 'TX', zip: '73301', country: 'USA' },
        { id: 3, user_id: 3, street: '789 Pine Rd', city: 'Dallas', state: 'TX', zip: '75201', country: 'USA' },
      ]);
    });
};
