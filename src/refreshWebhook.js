// require('dotenv').config();
const { RcUserModel } = require('./models/rcUserModel');
const rcAPI = require('./lib/rcAPI');
const { checkAndRefreshAccessToken } = require('./lib/oauth');

async function refreshWebhook() {
    const rcUsers = await RcUserModel.findAll();
    for (const user of rcUsers) {
        try {
            console.log(`refreshing for ${user.id}`);
            await checkAndRefreshAccessToken(user, true);
            console.log(`renewing for webhook: ${user.webhookId}`);
            const webhookResponse = await rcAPI.renewWebhook(user.webhookId, user.accessToken);
            console.log(`new webhook: ${JSON.stringify(webhookResponse, null, 2)}`);
        }
        catch (e) {
            console.log(e);
        }
    }
}

// refreshWebhook();

exports.app = refreshWebhook;