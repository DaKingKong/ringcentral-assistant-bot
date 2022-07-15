const ClientOAuth2 = require('client-oauth2');
const axios = require('axios');

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

async function checkAndRefreshAccessToken(rcUser) {
    const dateNow = new Date();
    if (rcUser && rcUser.refreshToken && (rcUser.tokenExpiredAt < dateNow || !rcUser.accessToken)) {
        console.log(`refreshing token...revoking ${rcUser.accessToken}`);
        const token = oauthApp.createToken(rcUser.accessToken, rcUser.refreshToken);
        const { accessToken, refreshToken, expires } = await token.refresh();
        console.log(`refreshing token...updating new token: ${rcUser.accessToken}`);
        rcUser.accessToken= accessToken;
        rcUser.refreshToken= refreshToken;
        rcUser.tokenExpiredAt= expires;
        await rcUser.save();
    }
}

async function revokeToken(rcUser, basicAuth){
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