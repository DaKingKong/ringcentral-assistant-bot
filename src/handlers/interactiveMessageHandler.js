const Bot = require('ringcentral-chatbot-core/dist/models/Bot').default;
const moment = require('moment');
const { rcUserModel } = require('../models/rcUserModel');
const { replySettingModel } = require('../models/replySettingModel');
const cardBuilder = require('../lib/cardBuilder');
const dialogBuilder = require('../lib/dialogBuilder');

const onCardSubmission = async (req, res) => {
    try {
        const submitData = req.body.data;
        const cardId = req.body.card.id;
        console.log(`=====incomingCard=====\n${JSON.stringify(req.body, null, 2)}`);
        const bot = await Bot.findByPk(submitData.botId);
        const rcUser = await rcUserModel.findByPk(submitData.rcUserId);
        const replySetting = await replySettingModel.findOne({
            where: {
                rcUserId: rcUser.id
            }
        });
        let dialogResponse = {
            type: "dialog",
            dialog: null
        };
        if (bot) {
            switch (submitData.actionType) {
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
                    await replySetting.update({
                        enableGroupMentionResponse: submitData.groupMentionResponse
                    });
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
                    await replySetting.update({
                        busyOn: submitData.isOn,
                        busyReply: submitData.reply
                    });
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
                    await replySetting.update({
                        offlineOn: submitData.isOn,
                        offlineReply: submitData.reply
                    });
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
                    await replySetting.update({
                        smsOn: submitData.isOn,
                        smsReply: submitData.reply
                    });
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
                    await replySetting.update({
                        outOfOfficeStartDate: startDateTime,
                        outOfOfficeEndDate: endDateTime,
                        outOfOfficeReply: submitData.reply,
                        timezoneOffset: submitData.timezoneOffset
                    });
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