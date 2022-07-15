const { Template } = require('adaptivecards-templating');
const moment = require('moment');

const authCardTemplateJson = require('../adaptiveCardPayloads/authCard.json');
const unAuthCardTemplateJson = require('../adaptiveCardPayloads/unAuthCard.json');
const responseCardTemplateJson = require('../adaptiveCardPayloads/responseCard.json');
const settingsCardTemplateJson = require('../adaptiveCardPayloads/settingsCard.json');
const generalSettingsCardTemplateJson = require('../adaptiveCardPayloads/generalSettingsCard.json');
const toggleSettingCardTemplateJson = require('../adaptiveCardPayloads/toggleSettingCard.json');
const dateRangeSettingCardTemplateJson = require('../adaptiveCardPayloads/dateRangeSettingCard.json');

const ON_EMOJI = "🔔";
const OFF_EMOJI = "🔕";

function authCard(authLink, additionalInfoText) {
    const template = new Template(authCardTemplateJson);
    const cardData = {
        link: authLink,
        additionalInfoText,
        showAdditionalInfo: additionalInfoText != null
    }
    const card = template.expand({
        $root: cardData
    });
    return card;
}

function unAuthCard(botId, rcUserId, additionalInfoText) {
    const template = new Template(unAuthCardTemplateJson);
    const cardData = {
        botId,
        rcUserId,
        additionalInfoText,
        showAdditionalInfo: additionalInfoText != null
    }
    const card = template.expand({
        $root: cardData
    });
    return card;
}

function responseCard(message, warning) {
    const template = new Template(responseCardTemplateJson);
    const cardData = {
        message,
        warning
    }
    const card = template.expand({
        $root: cardData
    });
    return card;
}

// date format: YYYY-MM-DD, 10 digits
function settingsCard(botId, rcUserId, replySetting) {
    const template = new Template(settingsCardTemplateJson);
    const start = replySetting.outOfOfficeStartDate ? moment(replySetting.outOfOfficeStartDate).add(replySetting.timezoneOffset, 'hours') : '';
    const end = replySetting.outOfOfficeEndDate ? moment(replySetting.outOfOfficeEndDate).add(replySetting.timezoneOffset, 'hours') : '';
    const outOfOfficeEnabled = replySetting.outOfOfficeStartDate &&
        replySetting.outOfOfficeEndDate &&
        moment(new Date()).utc().isBetween(moment(replySetting.outOfOfficeStartDate), moment(replySetting.outOfOfficeEndDate), null, "[]");
    const cardData = {
        botId,
        rcUserId,
        enableGroupMentionResponse: replySetting.enableGroupMentionResponse ? 'Enabled' : 'Disabled',
        busyEnable: replySetting.busyOn ? ON_EMOJI : OFF_EMOJI,
        busyReply: replySetting.busyReply ?? '',
        offlineEnable: replySetting.offlineOn ? ON_EMOJI : OFF_EMOJI,
        offlineReply: replySetting.offlineReply ?? '',
        smsEnable: replySetting.smsOn ? ON_EMOJI : OFF_EMOJI,
        smsReply: replySetting.smsReply ?? '',
        outOfOfficeEnable: outOfOfficeEnabled ? ON_EMOJI : OFF_EMOJI,
        outOfOfficeStartDate: start ? start.format('YYYY/MM/DD HH:mm') : '',
        outOfOfficeEndDate: end ? end.format('YYYY/MM/DD HH:mm') : '',
        outOfOfficeReply: replySetting.outOfOfficeReply ?? '',
    }
    const card = template.expand({
        $root: cardData
    });
    return card;
}

function generalSettingsCard(botId, rcUserId, enableGroupMentionResponse) {
    const template = new Template(generalSettingsCardTemplateJson);
    const cardData = {
        botId,
        rcUserId,
        enableGroupMentionResponse: enableGroupMentionResponse.toString()
    }
    const card = template.expand({
        $root: cardData
    });
    return card;
}

function toggleSettingCard(botId, rcUserId, settingType, on, replyText) {
    const template = new Template(toggleSettingCardTemplateJson);
    const cardData = {
        botId,
        rcUserId,
        settingType,
        on: on.toString(),
        replyText
    }
    const card = template.expand({
        $root: cardData
    });
    return card;
}

// date format: YYYY-MM-DD, 10 digits
function dateRangeSettingCard(botId, rcUserId, settingType, startDateTime, endDateTime, timezoneOffset, replyText) {
    const template = new Template(dateRangeSettingCardTemplateJson);
    const start = startDateTime ? moment(startDateTime).add(timezoneOffset, 'hours') : '';
    const end = endDateTime ? moment(endDateTime).add(timezoneOffset, 'hours') : '';
    const cardData = {
        botId,
        rcUserId,
        settingType,
        startDate: start ? start.format('YYYY-MM-DD') : '',
        startTime: start ? start.format('HH:mm') : '',
        endDate: end ? end.format('YYYY-MM-DD') : '',
        endTime: end ? end.format('HH:mm') : '',
        timezoneOffset,
        replyText
    }
    const card = template.expand({
        $root: cardData
    });
    return card;
}

exports.authCard = authCard;
exports.unAuthCard = unAuthCard;
exports.responseCard = responseCard;
exports.settingsCard = settingsCard;
exports.generalSettingsCard = generalSettingsCard;
exports.toggleSettingCard = toggleSettingCard;
exports.dateRangeSettingCard = dateRangeSettingCard;