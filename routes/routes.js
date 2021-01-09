const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

var serviceAccount = require('../test-bot-ec8f9-firebase-adminsdk-gwsw1-bffa27ee06.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://test-bot-ec8f9-default-rtdb.firebaseio.com',
});

const db = admin.database();

router.get('/', (req, res) => {
    console.log('Holiiiiiiiiiiiiiiiiiiiiii');
    res.send({ response: 'Server is up and running.' }).status(200);
});

router.get('/twitch/live', (req, res) => {
    // const body = JSON.parse(res.body).data;
    // console.log(body);
    // if (Object.keys(body).length > 0) {
    //     console.log('Stream Received');
    // }
    console.log('chura get');
    console.log(req.query);
    console.log(req.query['hub.challenge']);
    console.log('chura get finish');
    db.ref('data').push(req.query['hub.challenge']);

    res.send(req.query['hub.challenge']).status(200);
    // res.send({ data: 'data' })
});

router.post('/twitch/live', (req, res) => {
    // const body = JSON.parse(res.body).data;
    // console.log(body);
    // if (Object.keys(body).length > 0) {
    //     console.log('Stream Received');
    // }
    // console.log(req.query);

    db.ref('data').push(req.body);

    console.log(req.body);

    res.send(req.body).status(200);
});

module.exports = router;
