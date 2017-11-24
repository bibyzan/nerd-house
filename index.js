const express = require('express');
const app = express();

const Nexmo = require('nexmo');
const nexmo = new Nexmo({
    apiKey: 'f8387d15',
    apiSecret: '4bc084afe29778d3'
});

app.get('/ring-doorbell', function (req, res) {

    nexmo.message.sendSms(
        16056389181, '15132529656', 'yo',
        function (err, responseData) {
            if (err) {
                console.log(err);r
            } else {
                console.dir(responseData);
            }
        }
    );
});

app.get('/',function (req,res) {
    res.send('thank you sire');
});

app.listen(process.env.PORT || 3000, function () {
  console.log('haiiiiiii');
});
