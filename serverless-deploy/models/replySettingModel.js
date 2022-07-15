const Sequelize = require('sequelize');
const { sequelize } = require('./sequelize');

exports.ReplySettingModel = sequelize.define('reply-setting', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  enableGroupMentionResponse: {
    type: Sequelize.BOOLEAN
  },
  busyOn: {
    type: Sequelize.BOOLEAN,
  },
  busyReply: {
    type: Sequelize.STRING,
  },
  offlineOn: {
    type: Sequelize.BOOLEAN,
  },
  offlineReply: {
    type: Sequelize.STRING,
  },
  smsOn: {
    type: Sequelize.BOOLEAN,
  },
  smsReply: {
    type: Sequelize.STRING,
  },
  outOfOfficeStartDate: {
    type: Sequelize.DATE,
  },
  outOfOfficeEndDate: {
    type: Sequelize.DATE,
  },
  outOfOfficeReply: {
    type: Sequelize.STRING,
  },
  timezoneOffset: {
    type: Sequelize.STRING,
  }
});
