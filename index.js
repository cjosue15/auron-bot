const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const token = require('./data/token.json');

const router = require('./routes/routes');
const { createTokenAuth, subscribetoWebhook } = require('./src/utils/utils');
app.use(express.json());
app.use(router);

if (!token.access_token) {
    createTokenAuth().then((_) => subscribetoWebhook());
}

app.listen(PORT, () => {
    console.log(`Server has started on PORT ${PORT}`);
});
