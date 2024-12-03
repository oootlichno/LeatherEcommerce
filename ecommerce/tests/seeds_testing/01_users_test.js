exports.seed = async function (knex) {
  await knex('users').del(); 
  await knex('users').insert([
    { id: 1, username: 'john_doe', email: 'john@example.com', password: 'hashed_password', name: 'John Doe' },
    { id: 2, username: 'jane_doe', email: 'jane@example.com', password: 'hashed_password', name: 'Jane Doe' },
    { id: 3, username: 'alice', email: 'alice@example.com', password: 'hashed_password', name: 'Alice'},
  ]);
};

