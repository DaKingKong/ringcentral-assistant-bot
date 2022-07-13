const path = require('path');
const { extendApp } = require('ringcentral-chatbot-core');
const { botHandler } = require('./handlers/botHandler');
const { rcUserModel } = require('./models/rcUserModel');
const { replySettingModel } = require('./models/replySettingModel');

const interactiveMessageHandler = require('./handlers/interactiveMessageHandler');
const authorizationHandler = require('./handlers/authorizationHandler');
const notificationHandler = require('./handlers/notificationHandler');
const viewHandler = require('./handlers/viewHandler');

// extends or override express app as you need
exports.appExtend = (app) => {
    const skills = [];
    const botConfig = {
        adminRoute: '/admin', // optional
        botRoute: '/bot', // optional
        models: { // optional
            rcUserModel,
            replySettingModel
        }
    }

    extendApp(app, skills, botHandler, botConfig);

    if (process.env.NODE_ENV !== 'test') {
        app.listen(process.env.PORT || process.env.RINGCENTRAL_CHATBOT_EXPRESS_PORT);
    }

    console.log('server running...');
    console.log(`bot oauth uri: ${process.env.RINGCENTRAL_CHATBOT_SERVER}${botConfig.botRoute}/oauth`);

    app.post('/interactive-messages', interactiveMessageHandler.onCardSubmission);
    app.get('/oauth-callback', authorizationHandler.oauthCallback);
    app.post('/notification', notificationHandler.notification);
    console.log(`card interactive message uri: ${process.env.RINGCENTRAL_CHATBOT_SERVER}/interactive-messages`);

    app.set('views', path.resolve(__dirname, './views'));
    app.set('view engine', 'pug');
    app.get('/client', viewHandler.setup);
}