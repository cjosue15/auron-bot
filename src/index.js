const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const router = require('./routes/routes');
app.use(express.json());
app.use(router);

const token = require('../data/token.json');

const { createTokenAuth, subscribetoWebhook } = require('./utils/utils');

if (!token.access_token) {
    createTokenAuth().then((_) => {
        subscribetoWebhook();
    });
}

app.listen(PORT, () => {
    console.log(`Server has started on PORT ${PORT}`);
});
