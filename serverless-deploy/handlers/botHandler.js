const cardBuilder = require('../lib/cardBuilder');
const oauth = require('../lib/oauth');
const { RcUserModel } = require('../models/rcUserModel');
const { ReplySettingModel } = require('../models/replySettingModel');

const HELPER_TEXT =
    "Hello human, this is **Ring Bot**. I can reply messages for you when you are not available(Busy, Offline or OOO). Tell me what to do with following commands:\n\n" +
    "`login`: **login** with your RingCentral account\n" +
    "`logout`: **logout** with your RingCentral account and clear all your data\n" +
    "`config`: **configure** your auto-response settings"

const botHandler = async event => {
    try {
        switch (event.type) {
            case 'BotJoinGroup':
                const { group: joinedGroup, bot: joinedBot } = event;
                await joinedBot.sendMessage(joinedGroup.id, { text: HELPER_TEXT });
                break;
            case 'Message4Bot':
                const { text, group, bot: messageBot, userId } = event;
                const existingRcUser = await RcUserModel.findByPk(userId);
                console.log(`=====incomingCommand.Message4Bot.${text}=====`);
                switch (text) {
                    case 'hello':
                        await messageBot.sendMessage(group.id, { text: 'hello' });
                        break;
                    case 'login':
                        if (existingRcUser) {
                            await messageBot.sendMessage(group.id, { text: 'Already logged in.' });
                            break;
                        }
                        const oauthApp = oauth.getOAuthApp();
                        const authLink = `${oauthApp.code.getUri({
                            state: `botId=${messageBot.id}&rcUserId=${userId}`
                        })}`;
                        const authCard = cardBuilder.authCard(authLink);
                        await messageBot.sendAdaptiveCard(group.id, authCard);
                        break;
                    case 'logout':
                        if (!existingRcUser) {
                            await messageBot.sendMessage(group.id, { text: 'Cannot find account.' });
                            break;
                        }
                        const unAuthCard = cardBuilder.unAuthCard(messageBot.id, userId);
                        await messageBot.sendAdaptiveCard(group.id, unAuthCard);
                        break;
                    case 'set':
                    case 'config':
                        const replySetting = await ReplySettingModel.findByPk(existingRcUser.replySettingId);
                        const settingsCard = cardBuilder.settingsCard(messageBot.id, existingRcUser.id, replySetting);
                        await messageBot.sendAdaptiveCard(group.id, settingsCard);
                        break;
                    default:
                        await messageBot.sendMessage(group.id, { text: HELPER_TEXT });
                        break;
                }
        }
    }
    catch (e) {
        console.log(e);
    }
}

exports.botHandler = botHandler;