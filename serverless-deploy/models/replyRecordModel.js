const Sequelize = require('sequelize');
const { sequelize } = require('./sequelize');

exports.ReplyRecordModel = sequelize.define('reply-record', {
// {id}={senderUserId}-{receiverUserId}
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
// 15min after the first message sent
  expiry: {
    type: Sequelize.DATE,
  }
});
