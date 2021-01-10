const express = require('express');
const { refreshTokens, isInvalidateSomeToken, savePreserveData, tweetNotify } = require('../utils/utils');
const router = express.Router();
const fs = require('fs');

router.get('/', (req, res) => {
    res.send({ response: 'Server is up and running.' }).status(200);
});

router.get('/live', (req, res) => {
    console.log(req.query);
    console.log(`hub.challenge ${req.query['hub.challenge']}`);
    res.send(req.query['hub.challenge']).status(200);
});

router.post('/live', (req, res) => {
    if (isInvalidateSomeToken()) {
        refreshTokens();
    } else {
        const preserveData = JSON.parse(fs.readFileSync('./data/dataStream.json', { encoding: 'utf8', flag: 'r' }));

        const data = req.body.data[0] || null;
        if (!preserveData) {
            console.log('send tweet');
            // tweetNotify(data);
        }
        savePreserveData(data);
    }

    res.send({ msg: 'ok' }).status(200);
});

module.exports = router;
