const { getOAuthApp, checkAndRefreshAccessToken, revokeToken } = require('../lib/oauth');
const Bot = require('ringcentral-chatbot-core/dist/models/Bot').default;
const { RcUserModel } = require('../models/rcUserModel');
const { ReplySettingModel } = require('../models/replySettingModel');
const rcAPI = require('../lib/rcAPI');
const cardBuilder = require('../lib/cardBuilder');
const { generate } = require('shortid');

async function oauthCallback(req, res) {
    const queryParams = new URLSearchParams(req.query.state)
    const botId = queryParams.get('botId');
    const rcUserId = queryParams.get('rcUserId');
    const oauthApp = getOAuthApp();
    const bot = await Bot.findByPk(botId);
    if (!bot) {
        console.error(`Bot not found with botId: ${botId}`);
        res.status(404);
        res.send('Bot not found');
        return;
    }

    const { accessToken, refreshToken, expires } = await oauthApp.code.getToken(req.url);
    if (!accessToken) {
        res.status(403);
        res.send('Params error');
        return;
    }

    console.log(`Receiving accessToken: ${accessToken} and refreshToken: ${refreshToken}`);
    try {
        // Create/Find DM conversation to the RC user
        const createGroupResponse = await rcAPI.createConversation([rcUserId], bot.token.access_token);

        // Find if it's existing user in our database
        let rcUser = await RcUserModel.findByPk(rcUserId);
        // Step2: If user doesn't exist, we want to create a new one
        if (!rcUser) {
            rcUser = await RcUserModel.create({
                id: rcUserId,
                botId,
                accessToken: accessToken,
                refreshToken: refreshToken,
                tokenExpiredAt: expires,
                rcDMGroupId: createGroupResponse.id
            });
        }
        // If user exists but logged out, we want to fill in token info
        else if (!rcUser.accessToken) {
            rcUser.accessToken = accessToken;
            rcUser.refreshToken = refreshToken;
            rcUser.tokenExpiredAt = expires;
            await rcUser.save();
        }

        let replySetting = null;
        // initialize reply settings
        if (!rcUser.replySettingId) {
            replySetting = await ReplySettingModel.create({
                id: generate(),
                enableGroupMentionResponse: false,
                busyOn: false,
                busyReply: '',
                offlineOn: false,
                offlineReply: '',
                smsOn: false,
                smsReply: '',
                outOfOfficeReply: '',
                timezoneOffset: '+0'
            });
            rcUser.replySettingId = replySetting.id;
            await rcUser.save();
        }
        else {
            replySetting = await ReplySettingModel.findByPk(rcUser.replySettingId);
        }

        const webhookResponse = await rcAPI.createWebHook(rcUser.id, rcUser.accessToken);
        rcUser.webhookId = webhookResponse.id;
        await rcUser.save();

        await bot.sendMessage(rcUser.rcDMGroupId, { text: 'Successfully logged in. Please configure your settings.' });
        const replySettingsCard = cardBuilder.settingsCard(bot.id, rcUser.id, replySetting);
        await bot.sendAdaptiveCard(rcUser.rcDMGroupId, replySettingsCard);
    } catch (e) {
        console.error(e);
        res.status(500);
        res.send('Internal error.');
        return;
    }
    res.status(200);
    res.send('<!doctype><html><body>Successfully authorized. Please close this page.<script>window.close()</script></body></html>')
};

async function unauthorize(rcUser) {
    await checkAndRefreshAccessToken(rcUser);
    if(rcUser.webhookId)
    {
        await rcAPI.deleteWebHook(rcUser.webhookId, rcUser.accessToken);
    }
    const credString = `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`;
    const buffer = new Buffer.from(credString);
    const basicAuth = buffer.toString('base64');
    await revokeToken(rcUser, basicAuth);
    const replySetting = await ReplySettingModel.findByPk(rcUser.replySettingId);
    await replySetting.destroy();
}


exports.oauthCallback = oauthCallback;
exports.unauthorize = unauthorize;