const express = require('express');
const { format } = require('morgan');
const app = express();
const morgan = require('morgan');
const PORT = process.env.PORT || 3000;

const router = require('./routes/routes');
app.use(morgan('combined'));
app.use(express.json(format()));
app.use(router);

const { createTokenAuth, subscribetoWebhook } = require('./utils/utils');

createTokenAuth().then(() => {
    subscribetoWebhook();
});

setInterval(() => {
    createTokenAuth();
}, 4500000 * 1000);

setInterval(() => {
    subscribetoWebhook();
}, process.env.SECONDS_SUSCRIBE * 1000);

app.listen(PORT, () => {
    console.log(`Server has started on PORT ${PORT}`);
});
