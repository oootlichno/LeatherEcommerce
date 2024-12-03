const knex = require('../tests/dbSetup_test'); 

const resetDatabase = async () => {
  try {
    await knex.migrate.rollback(null, true);
    await knex.migrate.latest();
    await knex.seed.run();
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
};

module.exports = {
  resetDatabase,
};