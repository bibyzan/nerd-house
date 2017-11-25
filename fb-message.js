const login = require("facebook-chat-api");
var fs = require('fs')

login({email: process.env.FACEBOOK_USERNAME, password: process.env.FACEBOOK_PASSWORD}, function (err, api) {
    if(err) return console.error(err);

    fs.readFile('messages.json', 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {
            var messages = JSON.parse(data); //now it an object
            //fs.writeFile('myjsonfile.json', json, 'utf8', callback); // write it back

            var randomInt = parseInt(Math.random() * messages.messages.length);

            api.sendMessage(messages.messages[randomInt],'1759489744121223', function (err, messageInfo) {
                if (err) return console.error(err);
                console.log(messageInfo)
            });
        }
    });


});