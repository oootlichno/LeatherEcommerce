require('dotenv').config();

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3',
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },
  testing: {
    client: 'sqlite3',
    connection: {
      filename: './tests/test.sqlite3',
    },
    useNullAsDefault: true,
    migrations: {
      directory: './tests/migrations_testing',
    },
    seeds: {
      directory: './tests/seeds_testing',
    },
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },
};