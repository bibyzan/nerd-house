const login = require("facebook-chat-api");

// Create simple echo bot
login({email: process.env.FACEBOOK_USERNAME, password: process.env.FACEBOOK_PASSWORD}, function (err, api) {
    if(err) return console.error(err);

    api.sendMessage('doorbell ring','1759489744121223', function (err, messageInfo) {
       if (err) return console.error(err)
       console.log(messageInfo)
    });

});