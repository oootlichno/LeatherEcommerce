const knex = require('knex');
const knexConfig = require('../knexfile');

const db = knex(knexConfig.development);

async function resetDatabase() {
  await db.migrate.rollback();
  await db.migrate.latest();
  await db.seed.run();
}

module.exports = { db, resetDatabase };