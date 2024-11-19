exports.up = function (knex) {
    return knex.schema.createTable('categories', (table) => {
      table.increments('id').primary();
      table.string('name', 255).notNullable().unique();
      table.text('description').nullable();
      table.timestamps(true, true);
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTableIfExists('categories');
  };