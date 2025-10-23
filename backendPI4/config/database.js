var Sequelize = require("sequelize");
const PASSWORDDB = process.env.PASSWORDDB;
const NOMEDB = process.env.NOMEDB;
const HOSTNAMEDB = process.env.HOSTNAMEDB;
const USERNAMEDB = process.env.USERNAMEDB;
const sequelize = new Sequelize(NOMEDB, USERNAMEDB, PASSWORDDB, {
  host: HOSTNAMEDB,
  port: "5432",
  dialect: "postgres",
});
module.exports = sequelize;
