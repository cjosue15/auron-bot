const express = require('express');
const cron = require('node-cron');
const fs = require('fs');
const app = express();
const morgan = require('morgan');
const PORT = process.env.PORT || 3000;

const router = require('./routes/routes');
app.use(morgan('combined'));
app.use(express.json());
app.use(router);

const { createTokenAuth, subscribetoWebhook, readRefreshData, savefreshData } = require('./utils/utils');

createTokenAuth().then(() => {
    subscribetoWebhook();
});

const task = cron.schedule(
    '0 0 */1 * *',
    () => {
        let { tokenAuth, tokenWebHook } = readRefreshData();
        tokenAuth++;
        tokenWebHook++;

        if (tokenAuth === 49) {
            createTokenAuth();
            tokenAuth = 0;
        }

        if (tokenWebHook === 9) {
            subscribetoWebhook();
            tokenWebHook = 0;
        }

        savefreshData({ tokenAuth, tokenWebHook });
    },
    {
        schedule: false,
    }
);

task.start();

app.listen(PORT, () => {
    console.log(`Server has started on PORT ${PORT}`);
});
