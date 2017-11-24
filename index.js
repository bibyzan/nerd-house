const express = require('express');
var http = require('http');
var querystring = require('querystring');
const app = express();
const pg = require('pg');
const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});

var Twitter = require('twitter');

var twitterClient = new Twitter({
    consumer_key: 'Umvc4nvjzmiaf5Kcy4vQS7AqD',
    consumer_secret: 'EF1InzRSFm17NABgLlBVbgqAeFHEyMerPZ36k2qWjPcySQuPf1',
    access_token_key: '113221671-fJmt2K80dWJYBWJC58DRP6kq5Nh7lR0q6zEN8T0Y',
    access_token_secret: 'O0gf0sQyjPNemjsxDW2SwBDevyAUN7gtY7HnnccNbSZxX'
});

client.connect();
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.post('/generateThanks', function (req, res) {
    console.log(req);
    res.sendStatus(200);
});

app.post('/twitter/callback', function (req, res) {
   res.send(200)
});

var cheersForRecipient = function (recipient, parentID, completion) {
    recipient = recipient.split('|')[1].replace('>','');
    var queryStr = 'select * from Recognitions where recipients=\''+recipient+'\' and parentRecognitionID=' + parentID;
    console.log(queryStr);
    client.query(queryStr, function (err, res) {
        if (err) {
            console.log('error getting cheers: ' + err);
        } else {
            console.log('success getting cheers');
            for (var i = 0; i < res.rows.length; i++) {
                console.log(JSON.stringify(res.rows[i]));
            }
            completion(res.rows.length, recipient);
        }
    })
};

var recipientsForRecognition = function(recognition_id, completion) {
    var queryStr = 'select recipients from Recognitions where recognitionID=' + recognition_id;

    client.query(queryStr, function (err, res) {

        if (err) {
            console.log('error selecting recipients: ' + err);
        } else {
            console.log('success getting recipients');
            for (var i = 0; i < res.rows.length; i++) {
                console.log(JSON.stringify(res.rows[i]));
            }
            console.log(JSON.stringify(res));
            var thing = JSON.parse(JSON.stringify(res.rows[0])).recipients;
            console.log(thing);
            completion(thing);
        }
    })
};

function cheersForRecognition(recognition_id, completion) {
    var gotRecipients = function (recipients) {
        recipients = recipients.split('and');
        var results = [];

        var cheersCount = 0;
        for (var i = 0; i < recipients.length; i++) {
            var gotCheers = function (count, recipient) {
                cheersCount++;
                results.push({
                    'recipient':recipient,
                    'count': count
                });
                console.log({
                    'recipient':recipient,
                    'count': count
                });
                if (cheersCount === recipients.length) {
                    console.log('results breh: ' + results);
                    completion(results);

                }
            };
            cheersForRecipient(recipients[i],recognition_id, gotCheers);
        }
    };

    recipientsForRecognition(recognition_id, gotRecipients);
}

app.post('/slack/action', function (req, res) {
   console.log("gotim");
   console.log(JSON.stringify(req.body));

   var info = JSON.parse(req.body.payload);
   console.log(info);

   console.log(info.user);
   var sender = info.user.name;
   var recipient = info.actions[0].value;
   var parentID = info.callback_id.split('_')[2];
   var recognize = new Recognition(sender,recipient,'cheer','slack',parentID);

   var completion = function (id) {
       var gotCheers = function (results) {
            var buttons = [];
            for (var i = 0; i < results.length; i++) {
                buttons.push({
                    "name":"cheer",
                    "text": '@' + results[i].recipient + ':raised_hands:' + results[i].count,
                    "type": "button",
                    "value": results[i].recipient
                });
            }
           buttons.push({
               "name": "cheer",
               "text": "spread the love",
               "type": "button",
               "value": "spread",
               "style" : "primary"
           });

           res.send({
               "response_type": "in_channel",
               "text": "@" + sender + ": pls",
               "attachments": [
                   {
                       "text": "cheer to appreciate these people!",
                       "fallback": "error",
                       "callback_id": "cheer_menu_" + parentID,
                       "color": "#3AA3E3",
                       "attachment_type": "default",
                       "actions": buttons
                   }
               ]
           });
       };
       cheersForRecognition(parentID,gotCheers);
   };

   if (sender === recipient) {
       completion(null);
   } else {
       recognize.create(completion);
   }
});

app.post('/slack/recognize', function (req, res) {
    console.log("gotcha");
    console.log(JSON.stringify(req.body));

    var sender = req.body.user_name;
    var text = req.body.text.split('mentions')[0];
    var recipients = req.body.text.split('mentions')[1].replace(' ','').split('and');
    var recognize = new Recognition(sender, req.body.text.split('mentions')[1],text,'slack',null);

    var completion = function(id) {
        var buttons = [];
        for (var i = 0; i < recipients.length; i++) {
            buttons.push({
                "name":"cheer",
                "text": '@' + recipients[i].split('|')[1].replace('>',''),
                "type": "button",
                "value": recipients[i].split('|')[1].replace('>','')
            });
        }

        buttons.push({
            "name": "cheer",
            "text": "spread the love",
            "type": "button",
            "value": "spread",
            "style" : "primary"
        });

        res.send({
            "response_type": "in_channel",
            "text": "@" + sender + ": " + text,
            "attachments": [
                {
                    "text": "cheer to appreciate these people!",
                    "fallback": "error",
                    "callback_id": "cheer_menu_" + id,
                    "color": "#3AA3E3",
                    "attachment_type": "default",
                    "actions": buttons
                }
            ]
        });
    };

    recognize.create(completion);
    /*var Slack = require('slack-node');

    var webhookUri = "https://hooks.slack.com/services/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";

    var slack = new Slack();
    slack.setWebhook(webhookUri);

    slack.webhook({
        channel: "#recognition-tracker",
        username: "appreciation-fairy",
        text: "This is posted to #general and comes from a bot named webhookbot.",
        attachments: ""
    }, function(err, response) {
        console.log(response);
    });*/

    /*const postData = {
        'text': sender + " says: " + text
    };

    const options = {
        hostname: 'hooks.slack.com',
        port: 443,
        path: '/services/T0419J4B6/B7V3RSBC4/a6aW8JJpABNVAkPsgTSP4M3Z',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData, 'utf8')
        }
    };

    const reqHook = http.request(options, function(res) {
        console.log('status code: ' + res.statusCode);
        console.log('header: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            console.log('body: ' + chunk);
        });
        res.on('end', function () {
            console.log('No more data in response.');
        });
    });

    reqHook.on('error', function (e) {
        console.error('problem with request: ' + e.message);
    });

// write data to request body
    reqHook.write(postData);
    reqHook.end();*/
});

app.get('/',function (req,res) {
    res.send('thank you sire');
});

app.listen(process.env.PORT || 3000, function () {
  console.log('haiiiiiii');
});

function Recognition(sender, recipients, message, platform, parentID) {
    this.sender = sender;
    this.parentID = parentID;
    this.recipients = recipients;
    this.message = message;
    this.platform = platform;
}

Recognition.prototype.create = function (completion) {
    var queryStr = 'insert into Recognitions ' +
        '(parentRecognitionID,recipients,sender,message,platform)' +
        'values (' + this.parentID + ',\'' + this.recipients + '\',\'' + this.sender + '\',\'' + this.message + '\',\'' + this.platform + '\') returning recognitionID';

    client.query(queryStr, function (err, res) {

        if (err) {
            console.log('error making db: ' + err);
        } else {
            console.log('success making row');
            for (var i = 0; i < res.rows.length; i++) {
                console.log(JSON.stringify(res.rows[i]));
            }
            console.log(JSON.stringify(res));
            var thing = JSON.parse(JSON.stringify(res.rows[0])).recognitionid;
            console.log(thing);
            completion(thing);
        }
    })
};