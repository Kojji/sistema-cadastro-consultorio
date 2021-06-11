require('dotenv').config()

module.exports = {
  development: {
    username: process.env.UNIQUE_NAME_PG_USER,
    password: process.env.UNIQUE_NAME_PG_PASSWD,
    database: process.env.UNIQUE_NAME_PG_DB,
    host: process.env.UNIQUE_NAME_PG_HOST,
    port: process.env.UNIQUE_NAME_PG_PORT,
    dialect: "postgres",
  },
  test: {
    username: process.env.UNIQUE_NAME_PG_USER,
    password: process.env.UNIQUE_NAME_PG_PASSWD,
    database: process.env.UNIQUE_NAME_PG_DB,
    host: process.env.UNIQUE_NAME_PG_HOST,
    port: process.env.UNIQUE_NAME_PG_PORT,
    dialect: "postgres",
  },
  production: {
    username: process.env.UNIQUE_NAME_PG_USER,
    password: process.env.UNIQUE_NAME_PG_PASSWD,
    database: process.env.UNIQUE_NAME_PG_DB,
    host: process.env.UNIQUE_NAME_PG_HOST,
    port: process.env.UNIQUE_NAME_PG_PORT,
    ssl: true,
    dialect: "postgres",
    dialectOptions: { ssl: { require: true }, useUTC: false },
    timezone: "-03:00",
  },
}
