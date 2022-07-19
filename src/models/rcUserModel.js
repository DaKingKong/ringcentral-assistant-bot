const Sequelize = require('sequelize');
const { sequelize } = require('./sequelize');

exports.RcUserModel = sequelize.define('rc-user', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  botId: {
    type: Sequelize.STRING,
  },
  rcDMGroupId: {
    type: Sequelize.STRING,
  },
  webhookId: {
    type: Sequelize.STRING,
  },
  replySettingId: {
    type: Sequelize.STRING,
  },
  accessToken: {
    type: Sequelize.STRING,
  },
  refreshToken: {
    type: Sequelize.STRING,
  },
  tokenExpiredAt: {
    type: Sequelize.DATE,
  }
});
