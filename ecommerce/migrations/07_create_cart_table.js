exports.up = function (knex) {
    return knex.schema.createTable("cart", (table) => {
      table.increments("id").primary(); // Auto-incrementing primary key
      table.integer("user_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE");
      table.integer("product_id").unsigned().notNullable().references("id").inTable("products").onDelete("CASCADE");
      table.decimal("price", 10, 2).notNullable(); // Price of the product
      table.integer("quantity").notNullable(); // Quantity of the product
      table.timestamp("created_at").defaultTo(knex.fn.now()); // Timestamp for creation
      table.timestamp("updated_at").defaultTo(knex.fn.now()); // Timestamp for updates
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTableIfExists("cart");
  };
