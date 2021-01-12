const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');
const dayjs = require('dayjs');

const Twit = require('twit');
const config = require('./acces.js');
const T = new Twit(config);

const createTokenAuth = async () => {
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
            expires_in_date: dayjs().add(data.expires_in, 's').format(),
        };

        await fs.writeFileSync('./data/token.json', JSON.stringify(dataToSave));

        return dataToSave;
    } catch (error) {
        console.log(error.message);
    }
};

const subscribetoWebhook = async () => {
    const headers = {
        'Content-Type': 'application/json',
        'Client-ID': process.env.CLIENT_ID,
        Authorization: `Bearer ${readTokenAuth().access_token}`,
    };

    try {
        const response = await fetch('https://api.twitch.tv/helix/webhooks/hub', {
            method: 'post',
            body: JSON.stringify({
                'hub.mode': 'subscribe',
                'hub.callback': 'http://159.203.167.191/live',
                'hub.topic': `https://api.twitch.tv/helix/streams?user_id=${process.env.STREAMER_ID}`,
                'hub.lease_seconds': process.env.SECONDS_SUSCRIBE,
                'hub.secret': process.env.CLIENT_SECRET,
            }),
            headers: headers,
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const dataToSave = {
            status: response.status,
            expires_in: dayjs().add(Number(process.env.SECONDS_SUSCRIBE), 's').format(),
        };

        await fs.writeFileSync('./data/responseSuscribe.json', JSON.stringify(dataToSave));
    } catch (error) {
        console.log('error');
        console.log(error.message);
    }
};

const savePreserveData = (data) => {
    fs.writeFileSync('./data/dataStream.json', JSON.stringify(data));
};

const tweetNotify = async ({ game_name, title }) => {
    try {
        const options = { screen_name: 'BotAuronplay', count: 1 };
        const allTweets = await T.get('statuses/user_timeline', options);
        const text = allTweets.data.length > 0 ? allTweets.data[0].text : '#0~';
        const number = Number(text.match('\\#(.*)~')[1]);
        const tweet = {
            status: `Auronplay ha comenzado a transmitir. #${
                number + 1
            }~\nTitulo: ${title}\nJuego: ${game_name}\nPuedes verlo aqui 👉 https://www.twitch.tv/auronplay`,
        };

        await T.post('statuses/update', tweet);
    } catch (error) {
        console.log('error en tweet ' + error);
    }
};

const readTokenAuth = () => {
    return JSON.parse(fs.readFileSync('./data/token.json', { encoding: 'utf8', flag: 'r' }));
};

const readRefreshData = () => {
    return JSON.parse(fs.readFileSync('./data/refreshData.json', { encoding: 'utf8', flag: 'r' }));
};

const savefreshData = (data) => {
    fs.writeFileSync('./data/refreshData.json', JSON.stringify(data));
};

module.exports = {
    createTokenAuth,
    subscribetoWebhook,
    savePreserveData,
    tweetNotify,
    readTokenAuth,
    readRefreshData,
    savefreshData,
};
