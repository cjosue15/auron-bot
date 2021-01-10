const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const router = require('./routes/routes');
app.use(express.json());
app.use(router);

const { createTokenAuth, subscribetoWebhook, readTokenAuth } = require('./utils/utils');

const token = readTokenAuth();

if (!token.access_token) {
    createTokenAuth().then((data) => {
        subscribetoWebhook(data.access_token);
    });
}

app.listen(PORT, () => {
    console.log(`Server has started on PORT ${PORT}`);
});
