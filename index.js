const express = require('express');
const login = require("facebook-chat-api");
const app = express();

app.get('/ring-doorbell', function (req, res) {
    login({email: process.env.FACEBOOK_USERNAME, password: process.env.FACEBOOK_PASSWORD}, function (err, api) {
        if(err) return console.error(err);

        fs.readFile('messages.json', 'utf8', function readFileCallback(err, data){
            if (err){
                console.log(err);
            } else {
                var messages = JSON.parse(data); //now it an object
                var randomInt = parseInt(Math.random() * messages.messages.length);

                api.sendMessage(messages.messages[randomInt],'1759489744121223', function (err, messageInfo) {
                    if (err) return console.error(err);
                    console.log(messageInfo)
                });
                res.send('wasup');
            }
        });


    });
});

app.get('/',function (req,res) {
    res.send('thank you sire');
});

app.listen(process.env.PORT || 3000, function () {
  console.log('haiiiiiii');

});

