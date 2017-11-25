const login = require("facebook-chat-api");
var fs = require('fs')

login({email: process.env.FACEBOOK_USERNAME, password: process.env.FACEBOOK_PASSWORD, forceLogin: true}, function (err, api) {
    if(err) return console.error(err);

    api.listen(function (err, message) {
        console.log(JSON.stringify(message));
        //message = JSON.parse(message);
        if (message.threadID === '1759489744121223') {
            if (message.body.indexOf('add-response') != -1) {
                fs.readFile('messages.json', 'utf8', function readFileCallback(err, data){
                    if (err){
                        console.log(err);
                    } else {
                        var messages = JSON.parse(data); //now it an object

                        if (message.body.indexOf(':') != -1) {
                            messages.messages.push(message.body.split(":")[1])
                            var json = JSON.stringify(messages); //convert it back to json
                            fs.writeFile('messages.json', json, 'utf8'); // write it back

                        }
                    }
                });
            }
        }
    });
});