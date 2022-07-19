const ClientOAuth2 = require('client-oauth2');
const axios = require('axios');
const moment = require('moment');
const url = require('url');

// oauthApp strategy is default to 'code' which use credentials to get accessCode, then exchange for accessToken and refreshToken.
// To change to other strategies, please refer to: https://github.com/mulesoft-labs/js-client-oauth2
const oauthApp = new ClientOAuth2({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    accessTokenUri: process.env.ACCESS_TOKEN_URI,
    authorizationUri: process.env.AUTHORIZATION_URI,
    redirectUri: `${process.env.RINGCENTRAL_CHATBOT_SERVER}/oauth-callback`,
    scopes: ''
});

function getOAuthApp() {
    return oauthApp;
}

async function checkAndRefreshAccessToken(rcUser, force = false) {
    const dateNow = new Date();
    const buff = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`);
    const basicAuth = buff.toString('base64');
    if (rcUser && rcUser.refreshToken && (force || moment(rcUser.tokenExpiredAt).isBefore(moment(dateNow)) || !rcUser.accessToken)) {
        console.log(`refreshing token...revoking ${rcUser.refreshToken}`);
        const params = new url.URLSearchParams(
            {
                refresh_token: rcUser.refreshToken,
                grant_type: 'refresh_token'
            });
            console.log(params.toString());
        const refreshResponse = await axios.post(
            process.env.ACCESS_TOKEN_URI,
            params.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${basicAuth}`
                }
            }
        );
        rcUser.accessToken = refreshResponse.data.access_token;
        rcUser.refreshToken = refreshResponse.data.refresh_token;
        rcUser.tokenExpiredAt = moment(dateNow).add(refreshResponse.data.expires_in, 'minutes').toDate();
        await rcUser.save();
    }
}

async function revokeToken(rcUser, basicAuth) {
    await checkAndRefreshAccessToken(rcUser);
    await axios.post(
        `${process.env.REVOKE_TOKEN_URI}?token=${rcUser.refreshToken}`,
        null,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${basicAuth}`
            }
        }
    );
}

exports.getOAuthApp = getOAuthApp;
exports.checkAndRefreshAccessToken = checkAndRefreshAccessToken;
exports.revokeToken = revokeToken;