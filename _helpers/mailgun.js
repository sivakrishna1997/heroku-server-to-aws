// var API_KEY = 'key-2cf541cfaf6a5227e21cc3e7d21c32bc';
// var DOMAIN = 'sandboxf65a5505e938491a9e3ec2bbb85489bc.mailgun.org';


var API_KEY = '71c738d641f61fa3c5bf939aad81f477-e5e67e3e-8365697b';
// var API_KEY = 'pubkey-3ca11f3231e3aa8e2c212da353aa560b'
var DOMAIN = 'sandbox3dd3cbcbc1a44639b31877aaf14ae4a8.mailgun.org';

var mailgun = require('mailgun-js')({ apiKey: API_KEY, domain: DOMAIN });



module.exports = {
    sentMail: sentMail
}

function sentMail(to, subject, options) {
    return new Promise((resolve, reject) => {
        if (!!to && !!subject) {

            const data = {
                from: '<aaimentr@gmail.com>',
                to: to,
                subject: subject,
                // text: 'Testing some Mailgun awesomeness!'
            };
            if (options.html) {
                data.html = options.html;
            } else if (options.text) {
                data.text = "URL will be replaced here..";
            } else {
                console.log("body not sent!!");
            }

            mailgun.messages().send(data, (err, res) => {
                if (err) {
                    console.log("===========>", err);
                    reject({ sent: false, err: err });
                } else {
                    console.log("res========>", res);
                    resolve({ sent: true, msg: "Mail Sent!!" });
                }
            });
        } else {
            reject({ sent: false, msg: "Invalid Options" });
        }
    })
}
