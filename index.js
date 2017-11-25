const express = require('express');
const login = require("facebook-chat-api");
const app = express();

const Nexmo = require('nexmo');
const nexmo = new Nexmo({
    apiKey: 'f8387d15',
    apiSecret: '4bc084afe29778d3'
});

app.get('/ring-doorbell', function (req, res) {
    login({email: process.env.FACEBOOK_USERNAME, password: process.env.FACEBOOK_PASSWORD}, function (err, api) {
        if(err) return console.error(err);

        api.sendMessage('doorbell ring','1759489744121223', function (err, messageInfo) {
            if (err) return console.error(err)
            console.log(messageInfo)
        });

    });
});

app.get('/',function (req,res) {
    res.send('thank you sire');
});

app.listen(process.env.PORT || 3000, function () {
  console.log('haiiiiiii');
});
