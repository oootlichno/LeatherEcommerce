exports.up = function (knex) {
    return knex.schema.createTable('products', (table) => {
      table.increments('id').primary();
      table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('CASCADE');
      table.string('name', 255).notNullable().unique();
      table.text('description').nullable();
      table.decimal('price', 10, 2).notNullable();
      table.string('image_url').nullable();
      table.integer('stock').defaultTo(0);
      table.timestamps(true, true);
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTableIfExists('products');
  };