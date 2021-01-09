const express = require('express');
const { refreshTokens, isInvalidateSomeToken, savePreserveData } = require('../utils/utils');
const router = express.Router();
const preserveData = require('../../data/preserveData.json');

router.get('/', (req, res) => {
    res.send({ response: 'Server is up and running.' }).status(200);
});

router.get('/twitch/live', (req, res) => {
    console.log(req.query);
    console.log(`hub.challenge ${req.query['hub.challenge']}`);
    res.send(req.query['hub.challenge']).status(200);
});

router.post('/twitch/live', (req, res) => {
    if (isInvalidateSomeToken()) {
        refreshTokens();
    } else {
        const data = req.body.data[0] || null;
        console.log(preserveData);
        console.log(data);
        // if (!preserveData) {
        // }
        savePreserveData(data);
    }

    res.send({ msg: 'ok' }).status(200);
});

module.exports = router;
