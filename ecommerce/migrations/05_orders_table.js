exports.up = function (knex) {
    return knex.schema.createTable('orders', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.integer('shipping_address_id').unsigned().references('id').inTable('addresses').onDelete('CASCADE');
      table.enu('status', ['pending', 'completed', 'cancelled', 'shipped']).defaultTo('pending');
      table.decimal('total', 10, 2).notNullable();
      table.timestamps(true, true);
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTableIfExists('orders');
  };