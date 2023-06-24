const config = require('./config');

module.exports = {
  username: config.sequelize.username,
  password: config.sequelize.password,
  database: config.sequelize.dbName,
  host: config.sequelize.host,
  port: config.sequelize.port,
  dialect: config.sequelize.dialect,
  dialectOptions: {
    bigNumberStrings: true,
  },
  define: {
    timestamps: true,
  },
  logging: config.env === 'development',
};
