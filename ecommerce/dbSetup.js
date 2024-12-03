const knex = require('knex');
const knexConfig = require('./knexfile');

const environment = process.env.NODE_ENV || 'development'; 
const db = knex(knexConfig[environment]);

console.log(`DB Initialized for environment: ${environment}`);

async function resetDatabase() {
  try {
    console.log("Resetting database...");
    await db.migrate.rollback();
    console.log("Migrations rolled back.");
    await db.migrate.latest();
    console.log("Migrations applied.");
    await db.seed.run();
    console.log("Seeds executed successfully.");
  } catch (error) {
    console.error("Error resetting database:", error.message);
    throw error; // Re-throw to handle errors in calling functions
  }
}

module.exports = db;