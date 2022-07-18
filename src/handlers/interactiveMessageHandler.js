const crypto = require('crypto');
const Bot = require('ringcentral-chatbot-core/dist/models/Bot').default;
const moment = require('moment');
const authorizationHandler = require('./authorizationHandler');
const { RcUserModel } = require('../models/rcUserModel');
const { ReplySettingModel } = require('../models/replySettingModel');
const { WatchUserModel } = require('../models/watchUserModel');
const cardBuilder = require('../lib/cardBuilder');
const dialogBuilder = require('../lib/dialogBuilder');
const rcAPI = require('../lib/rcAPI');

const onCardSubmission = async (req, res) => {
    try {
        // Shared secret can be found on RingCentral developer portal, under your app Settings
        const SHARED_SECRET = process.env.RINGCENTRAL_SHARED_SECRET;
        if (SHARED_SECRET) {
            const signature = req.get('X-Glip-Signature', 'sha1=');
            const encryptedBody =
                crypto.createHmac('sha1', SHARED_SECRET).update(JSON.stringify(req.body)).digest('hex');
            if (encryptedBody !== signature) {
                res.status(401).send();
                return;
            }
        }
        const submitData = req.body.data;
        const cardId = req.body.card.id;
        console.log(`=====incomingCardSubmission=====\n${JSON.stringify(req.body, null, 2)}`);
        const bot = await Bot.findByPk(submitData.botId);
        const rcUser = await RcUserModel.findByPk(submitData.rcUserId);
        const replySetting = await ReplySettingModel.findByPk(rcUser.replySettingId);
        let dialogResponse = {
            type: "dialog",
            dialog: null
        };
        if (bot) {
            switch (submitData.actionType) {
                case 'logout':
                    await authorizationHandler.unauthorize(rcUser);
                    const dmGroupId = rcUser.rcDMGroupId;
                    await rcUser.destroy();
                    await bot.sendMessage(dmGroupId, { text: 'successfully logged out.' });
                    break;
                case 'searchUser':
                    const searchResult = await rcAPI.searchUsersByName(submitData.username, rcUser.accessToken);
                    if (searchResult.records.length == 0) {
                        await bot.sendMessage(rcUser.rcDMGroupId, { text: `No user can be found with name **${submitData.username}**` });
                        break;
                    }
                    const userInfo = searchResult.records.map(r => {
                        return {
                            username: `${r.firstName} ${r.lastName}`,
                            botId: bot.id,
                            rcUserId: rcUser.id,
                            watcheeId: r.id,
                            watcheeName: `${r.firstName} ${r.lastName}`,
                            actionType: 'watchUser'
                        };
                    });
                    const watchUserSearchResultCard = cardBuilder.watchUserSearchResultCard(bot.id, rcUser.id, userInfo);
                    await bot.sendAdaptiveCard(rcUser.rcDMGroupId, watchUserSearchResultCard);
                    break;
                case 'watchUser':
                    const watchId = `${rcUser.id}-${submitData.watcheeId}`
                    const existingWatch = await WatchUserModel.findByPk(watchId);
                    if (existingWatch) {
                        await bot.sendMessage(rcUser.rcDMGroupId, { text: 'Already in watch.' });
                    }
                    else {
                        const webhookResponse = await rcAPI.createUserPresenceWebhook(rcUser.id, rcUser.accessToken, submitData.watcheeId);
                        await WatchUserModel.create({
                            id: watchId,
                            webhookId: webhookResponse.id,
                            watcheeName: submitData.watcheeName
                        });
                        await bot.sendMessage(rcUser.rcDMGroupId, { text: `A new watch created. I will notify you when ${submitData.watcheeName} is available.` });
                    }
                    break;
                case 'generalSettingsDialog':
                    const generalSettingsCard = cardBuilder.generalSettingsCard(bot.id, rcUser.id, replySetting.enableGroupMentionResponse);
                    const generalSettingsDialog = dialogBuilder.getCardDialog({
                        title: 'General Settings',
                        size: null,
                        iconURL: null,
                        card: generalSettingsCard
                    });
                    dialogResponse.dialog = generalSettingsDialog;
                    break;
                case 'submitGeneralSettings':
                    replySetting.enableGroupMentionResponse = submitData.groupMentionResponse == 'true' ? true : false;
                    await replySetting.save()
                    const settingsCardWithNewGeneralSettings = cardBuilder.settingsCard(bot.id, rcUser.id, replySetting);
                    await bot.updateAdaptiveCard(cardId, settingsCardWithNewGeneralSettings);
                    break;
                case 'busySettingDialog':
                    const busySettingCard = cardBuilder.toggleSettingCard(bot.id, rcUser.id, 'Busy', replySetting.busyOn, replySetting.busyReply);
                    const busySettingDialog = dialogBuilder.getCardDialog({
                        title: 'Busy Setting',
                        size: null,
                        iconURL: null,
                        card: busySettingCard
                    });
                    dialogResponse.dialog = busySettingDialog;
                    break;
                case 'submitBusySetting':
                    replySetting.busyOn = submitData.isOn == 'true' ? true : false;
                    replySetting.busyReply = submitData.reply;
                    await replySetting.save()
                    const settingsCardWithNewBusy = cardBuilder.settingsCard(bot.id, rcUser.id, replySetting);
                    await bot.updateAdaptiveCard(cardId, settingsCardWithNewBusy);
                    break;
                case 'offlineSettingDialog':
                    const offlineSettingCard = cardBuilder.toggleSettingCard(bot.id, rcUser.id, 'Offline', replySetting.offlineOn, replySetting.offlineReply);
                    const offlineSettingDialog = dialogBuilder.getCardDialog({
                        title: 'Offline Setting',
                        size: null,
                        iconURL: null,
                        card: offlineSettingCard
                    });
                    dialogResponse.dialog = offlineSettingDialog;
                    break;
                case 'submitOfflineSetting':
                    replySetting.offlineOn = submitData.isOn == 'true' ? true : false;
                    replySetting.offlineReply = submitData.reply;
                    await replySetting.save();
                    const settingsCardWithNewOffline = cardBuilder.settingsCard(bot.id, rcUser.id, replySetting);
                    await bot.updateAdaptiveCard(cardId, settingsCardWithNewOffline);
                    break;
                case 'smsSettingDialog':
                    const smsSettingCard = cardBuilder.toggleSettingCard(bot.id, rcUser.id, 'SMS', replySetting.smsOn, replySetting.smsReply);
                    const smsSettingDialog = dialogBuilder.getCardDialog({
                        title: 'SMS Setting',
                        size: null,
                        iconURL: null,
                        card: smsSettingCard
                    });
                    dialogResponse.dialog = smsSettingDialog;
                    break;
                case 'submitSMSSetting':
                    replySetting.smsOn = submitData.isOn == 'true' ? true : false;
                    replySetting.smsReply = submitData.reply;
                    await replySetting.save();
                    const settingsCardWithNewSMS = cardBuilder.settingsCard(bot.id, rcUser.id, replySetting);
                    await bot.updateAdaptiveCard(cardId, settingsCardWithNewSMS);
                    break;
                case 'outOfOfficeSettingDialog':
                    const outOfOfficeSettingCard = cardBuilder.dateRangeSettingCard(bot.id, rcUser.id, 'OutOfOffice', replySetting.outOfOfficeStartDate, replySetting.outOfOfficeEndDate, replySetting.timezoneOffset, replySetting.outOfOfficeReply, replySetting.outOfOfficeEmoji);
                    const outOfOfficeSettingDialog = dialogBuilder.getCardDialog({
                        title: 'Out Of Office Setting',
                        size: null,
                        iconURL: null,
                        card: outOfOfficeSettingCard
                    });
                    dialogResponse.dialog = outOfOfficeSettingDialog;
                    break;
                case 'submitOutOfOfficeSetting':
                    const startDateTime = moment.utc(`${submitData.startDate} ${submitData.startTime}`).add(-Number(submitData.timezoneOffset), 'hours');
                    const endDateTime = moment.utc(`${submitData.endDate} ${submitData.endTime}`).add(-Number(submitData.timezoneOffset), 'hours');
                    replySetting.outOfOfficeStartDate = startDateTime.toDate();
                    replySetting.outOfOfficeEndDate = endDateTime.toDate();
                    replySetting.outOfOfficeReply = submitData.reply;
                    replySetting.timezoneOffset = submitData.timezoneOffset;
                    await replySetting.save();
                    const settingsCardWithNewOutOfOffice = cardBuilder.settingsCard(bot.id, rcUser.id, replySetting);
                    await bot.updateAdaptiveCard(cardId, settingsCardWithNewOutOfOffice);
                    break;
            }
            res.status(200);
            res.send(dialogResponse);
            return;
        }
    }
    catch (e) {
        console.log(e);
        res.status(200);
        res.send('OK');
        return;
    }
}

exports.onCardSubmission = onCardSubmission;