const cardBuilder = require('../lib/cardBuilder');
const oauth = require('../lib/oauth');
const { rcUserModel } = require('../models/rcUserModel');
const { replySettingModel } = require('../models/replySettingModel');
const authorizationHandler = require('../handlers/authorizationHandler');

const botHandler = async event => {
    try {
        switch (event.type) {
            case 'BotJoinGroup':
                const { group: joinedGroup, bot: joinedBot } = event;
                await joinedBot.sendMessage(joinedGroup.id, { text: 'welcome' });
                break;
            case 'Message4Bot':
                const { text, group, bot: messageBot, userId } = event;
                const existingRcUser = await rcUserModel.findByPk(userId);
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
                        await authorizationHandler.unauthorize(existingRcUser);
                        await existingRcUser.destroy();
                        await messageBot.sendMessage(group.id, { text: 'successfully logged out.' });
                        break;
                    case 'set':
                    case 'config':
                        const replySetting = await replySettingModel.findOne({
                            where: {
                                rcUserId: existingRcUser.id
                            }
                        });
                        const settingsCard = cardBuilder.settingsCard(messageBot.id, existingRcUser.id, replySetting);
                        await messageBot.sendAdaptiveCard(group.id, settingsCard);
                        break;
                    case 'test':
                        break;
                }
        }
    }
    catch (e) {
        console.log(e);
    }
}

exports.botHandler = botHandler;