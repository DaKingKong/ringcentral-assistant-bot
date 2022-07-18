// require('dotenv').config();
const { RcUserModel } = require('./models/rcUserModel');
const rcAPI = require('./lib/rcAPI');
const { checkAndRefreshAccessToken } = require('./lib/oauth');

async function refreshWebhook() {
    const rcUsers = await RcUserModel.findAll();
    for (const user of rcUsers) {
        try {
            console.log(`refreshing for ${user.Id}`);
            checkAndRefreshAccessToken(user, true);
            await rcAPI.renewWebhook(user.webhookId, user.accessToken);
        }
        catch (e) {
            console.log(e.message);
        }
    }
}

// refreshWebhook();

exports.app = refreshWebhook;