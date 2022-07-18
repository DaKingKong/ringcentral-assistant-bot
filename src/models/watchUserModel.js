const Sequelize = require('sequelize');
const { sequelize } = require('./sequelize');

exports.WatchUserModel = sequelize.define('watch-user', {
  // {id}={watcherUserId}-{watcheeUserId}
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  webhookId: {
    type: Sequelize.STRING
  },
  watcheeName: {
    type: Sequelize.STRING
  }
});
