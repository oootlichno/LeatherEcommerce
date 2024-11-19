exports.seed = function (knex) {
  return knex('users')
    .del()
    .then(function () {
      return knex('users').insert([
        { id: 1, username: 'john_doe', email: 'john@example.com', password: 'hashedpassword123' },
        { id: 2, username: 'jane_doe', email: 'jane@example.com', password: 'hashedpassword456' },
        { id: 3, username: 'admin', email: 'admin@example.com', password: 'adminpassword' },
      ]);
    });
};
