const fetch = require('node-fetch');
const dotenv = require('dotenv');
const fs = require('fs');
const dayjs = require('dayjs');
dotenv.config();

const token = require('../../data/token.json');
const responseSuscribe = require('../../data/responseSuscribe.json');

const createTokenAuth = async () => {
    // return fetch(
    //     `https://id.twitch.tv/oauth2/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials`,
    //     { method: 'POST', body: {} }
    // )
    //     .then((response) => response.json())
    //     .then((data) => {
    //         const dataToSave = {
    //             ...data,
    //             expires_in: dayjs().add(data.expires_in, 's').format(),
    //         };

    //         fs.writeFileSync('./data/token.json', JSON.stringify(dataToSave));
    //     })
    //     .catch((error) => console.log(error));

    try {
        const response = await fetch(
            `https://id.twitch.tv/oauth2/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials`,
            { method: 'POST', body: {} }
        );

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const data = await response.json();

        const dataToSave = {
            ...data,
            expires_in: dayjs().add(data.expires_in, 's').format(),
        };

        await fs.writeFileSync('./data/token.json', JSON.stringify(dataToSave));

        return dataToSave;
    } catch (error) {
        console.log(error.message);
    }
};

const subscribetoWebhook = async (token = '') => {
    const headers = {
        'Content-Type': 'application/json',
        'Client-ID': process.env.CLIENT_ID,
        Authorization: `Bearer ${token}`,
    };

    try {
        const response = await fetch('https://api.twitch.tv/helix/webhooks/hub', {
            method: 'post',
            body: JSON.stringify({
                'hub.mode': 'subscribe',
                'hub.callback': 'https://auron-bot.herokuapp.com/twitch/live',
                'hub.topic': `https://api.twitch.tv/helix/streams?user_id=${process.env.STREAMER_ID}`,
                'hub.lease_seconds': '864000',
                'hub.secret': process.env.CLIENT_SECRET,
            }),
            headers: headers,
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const dataToSave = {
            status: response.status,
            expires_in: dayjs().add(864000, 's').format(),
        };

        await fs.writeFileSync('./data/responseSuscribe.json', JSON.stringify(dataToSave));
    } catch (error) {
        console.log('error');
        console.log(error.message);
    }
};

const refreshTokens = () => {
    // refresh auth token

    if (dayjs().format() >= token.expires_in) {
        // it's mean token need refresh
        createTokenAuth();
    }

    if (dayjs().format() >= responseSuscribe.expires_in) {
        subscribetoWebhook();
    }
};

const isInvalidateSomeToken = () => {
    return dayjs().format() >= token.expires_in || dayjs().format() >= responseSuscribe.expires_in;
};

const savePreserveData = async (data) => {
    try {
        await fs.writeFileSync('./data/dataStream.json', JSON.stringify(data));
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    createTokenAuth,
    subscribetoWebhook,
    refreshTokens,
    isInvalidateSomeToken,
    savePreserveData,
};
