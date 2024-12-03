exports.up = function (knex) {
    return knex.schema.createTable("cart", (table) => {
      table.increments("id").primary(); 
      table.integer("user_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE");
      table.integer("product_id").unsigned().notNullable().references("id").inTable("products").onDelete("CASCADE");
      table.decimal("price", 10, 2).notNullable(); 
      table.integer("quantity").notNullable(); 
      table.timestamp("created_at").defaultTo(knex.fn.now()); 
      table.timestamp("updated_at").defaultTo(knex.fn.now()); 
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTableIfExists("cart");
  };
