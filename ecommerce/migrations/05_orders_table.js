exports.up = function (knex) {
    return knex.schema.createTable('orders', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.timestamp('order_date').defaultTo(knex.fn.now()); 
      table.string('status').notNullable();
      table.decimal('total_price', 10, 2).notNullable();
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTableIfExists('orders');
  };