const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');
const dayjs = require('dayjs');

const Twit = require('twit');
const config = require('./acces.js');
const T = new Twit(config);

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

const subscribetoWebhook = async (authToken = '') => {
    const headers = {
        'Content-Type': 'application/json',
        'Client-ID': process.env.CLIENT_ID,
        Authorization: `Bearer ${authToken || token.access_token}`,
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
        // perhaps here i have to call other function to set if streamer is on live or not
        // save again data of the streamer
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

const tweetNotify = async ({ game_name, title }) => {
    try {
        const tweet = {
            status: `Auronplay ha comenzado a transmitir.\nTitulo: ${title}\nJuego: ${game_name}\nPuedes verlo aqui 👉 https://www.twitch.tv/auronplay`,
        };

        await T.post('statuses/update', tweet);
    } catch (error) {
        console.log('error en tweet ' + error);
        throw new Error(error.message);
    }
};

module.exports = {
    createTokenAuth,
    subscribetoWebhook,
    refreshTokens,
    isInvalidateSomeToken,
    savePreserveData,
    tweetNotify,
};
