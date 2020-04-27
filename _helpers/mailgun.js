var API_KEY = '65b08458-5b4abb7f';
var DOMAIN = 'www.aimentr.com';

var mailgun = require('mailgun-js')({ apiKey: API_KEY, domain: DOMAIN , host: 'api.eu.mailgun.net' });



module.exports = {
    sentMail: sentMail
}

function sentMail(to, subject, options) {
    return new Promise((resolve, reject) => {
        if (!!to && !!subject) {

            const data = {
                from: 'node mailer <dupilicatenodemailer@gmail.com>',
                to: to,
                subject: subject,
                text: 'Testing some Mailgun awesomeness!'
            };
            // if (options.html) {
            //     data.html = options.html;
            // } else if (options.text) {
            //     data.text = "URL will be replaced here..";
            // } else {
            //     console.log("body not sent!!");
            // }

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
