exports.up = function (knex) {
    return knex.schema.createTable('addresses', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.enu('type', ['shipping', 'billing']).notNullable();
      table.string('street', 255).notNullable();
      table.string('city', 255).notNullable();
      table.string('state', 255).notNullable();
      table.string('postal_code', 20).notNullable();
      table.string('country', 100).notNullable();
      table.timestamps(true, true);
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTableIfExists('addresses');
  };