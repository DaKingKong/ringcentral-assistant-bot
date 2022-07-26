const axios = require('axios');

const getUserInfo = async (userId, accessToken) => {
    const response = await axios.get(`${process.env.RINGCENTRAL_SERVER}/restapi/v1.0/glip/persons/${userId}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
        }
    });

    return response.data;
}

const createConversation = async (userIds, accessToken) => {
    const members = userIds.map(function (id) { return { id } });
    const postBody = {
        members
    };
    const response = await axios.post(`${process.env.RINGCENTRAL_SERVER}/restapi/v1.0/glip/conversations`,
        postBody,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        });

    return response.data;
}

const getChat = async (groupId, accessToken) => {
    const response = await axios.get(`${process.env.RINGCENTRAL_SERVER}/restapi/v1.0/glip/chats/${groupId}`,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        });

    return response.data;
}

const markChatUnread = async (groupId, accessToken) => {
    const response = await axios.post(`${process.env.RINGCENTRAL_SERVER}/restapi/v1.0/glip/chats/${groupId}/unread`,
        null,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        });

    return response.data;
}

const createPostInChat = async (groupId, accessToken, postText) => {
    const postBody = {
        text: postText
    };
    const response = await axios.post(`${process.env.RINGCENTRAL_SERVER}/restapi/v1.0/glip/chats/${groupId}/posts`,
        postBody,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        });

    return response.data;
}

const createCardInChat = async (groupId, accessToken, card) => {
    const response = await axios.post(`${process.env.RINGCENTRAL_SERVER}/restapi/v1.0/glip/chats/${groupId}/adaptive-cards`,
        card,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        });

    return response.data;
}

const createPostWebHook = async (rcUserId, accessToken) => {
    const postBody = {
        eventFilters: [
            '/restapi/v1.0/glip/posts',
            '/restapi/v1.0/account/~/extension/~/message-store/instant?type=SMS'
        ],
        expiresIn: 473040000,
        deliveryMode: {
            transportType: 'WebHook',
            address: process.env.RINGCENTRAL_CHATBOT_SERVER + `/notification?userId=${rcUserId}`,
        }
    }
    const response = await axios.post(`${process.env.RINGCENTRAL_SERVER}/restapi/v1.0/subscription?rcUserId=${rcUserId}`,
        postBody,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        });

    return response.data;
}

const createUserPresenceWebhook = async (rcUserId, accessToken, targetUserId) => {
    const postBody = {
        eventFilters: [
            `/restapi/v1.0/account/~/extension/${targetUserId}/presence`
        ],
        expiresIn: 473040000,
        deliveryMode: {
            transportType: 'WebHook',
            address: process.env.RINGCENTRAL_CHATBOT_SERVER + `/notification?userId=${rcUserId}`,
        }
    }
    const response = await axios.post(`${process.env.RINGCENTRAL_SERVER}/restapi/v1.0/subscription?rcUserId=${rcUserId}`,
        postBody,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        });

    return response.data;
}

const deleteWebHook = async (webhookId, accessToken) => {
    const response = await axios.delete(`${process.env.RINGCENTRAL_SERVER}/restapi/v1.0/subscription/${webhookId}`,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        });

    return response.data;
}

const getUserSelfPresence = async (accessToken) => {
    const response = await axios.get(`${process.env.RINGCENTRAL_SERVER}/restapi/v1.0/account/~/extension/~/unified-presence`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
        }
    });

    return response.data;
}

const sendSMS = async (text, fromNumber, toNumber, accessToken) => {
    const postBody = {
        text,
        to: [{
            phoneNumber: toNumber
        }],
        from: {
            phoneNumber: fromNumber
        }
    };
    const response = await axios.post(`${process.env.RINGCENTRAL_SERVER}/restapi/v1.0/account/~/extension/~/sms`,
        postBody,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        });

    return response.data;
}

const renewWebhook = async (webhookId, accessToken) => {
    const postBody = {
    };
    const response = await axios.post(`${process.env.RINGCENTRAL_SERVER}/restapi/v1.0/subscription/${webhookId}/renew`,
        postBody,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        });

    return response.data;
}

const searchUsersByName = async (name, accessToken) => {
    const postBody = {
        searchString: name,
        searchFields: [
            "firstName",
            "lastName"
        ],
        extensionType: "User"
    };
    const response = await axios.post(`${process.env.RINGCENTRAL_SERVER}/restapi/v1.0/account/~/directory/entries/search`,
        postBody,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        });

    return response.data;
}

exports.getUserInfo = getUserInfo;
exports.createConversation = createConversation;
exports.getChat = getChat;
exports.markChatUnread = markChatUnread;
exports.createPostInChat = createPostInChat;
exports.createCardInChat = createCardInChat;
exports.createPostWebHook = createPostWebHook;
exports.createUserPresenceWebhook = createUserPresenceWebhook;
exports.deleteWebHook = deleteWebHook;
exports.getUserSelfPresence = getUserSelfPresence;
exports.sendSMS = sendSMS;
exports.renewWebhook = renewWebhook;
exports.searchUsersByName = searchUsersByName;