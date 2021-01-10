const express = require('express');
const { format } = require('morgan');
const app = express();
const morgan = require('morgan');
const PORT = process.env.PORT || 3000;

const router = require('./routes/routes');
app.use(morgan('combined'));
app.use(express.json(format()));
app.use(router);

const { createTokenAuth, subscribetoWebhook, readTokenAuth } = require('./utils/utils');

const token = readTokenAuth();

// if (!token.access_token) {
createTokenAuth().then(() => {
    subscribetoWebhook();
});
// }

app.listen(PORT, () => {
    console.log(`Server has started on PORT ${PORT}`);
});
