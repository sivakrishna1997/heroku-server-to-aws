const send = require('gmail-send')


module.exports = {
    sentMail: sentMail
}

function sentMail(to, subject, options) {
    return new Promise((resolve, reject) => {
        if (!!to && !!subject) {

            var SendOptions = {
                user: 'dupilicatenodemailer@gmail.com',
                pass: 'nodemail@123',
                to: to,
                subject: subject,
            }

            if (options.html) {
                SendOptions.html = options.html;
            } else if (options.text) {
                mailOptions.text = "URL will be replaced here..";
            } else {
                console.log("body not sent!!");
            }
            send(SendOptions, (err, res) => {
                if (err) {
                    console.log("===========>",err);
                    reject({ sent: false, err: err });
                } else {
                    console.log("res========>",res);
                    resolve({ sent: true, msg: "Mail Sent!!" });
                }
            })
        } else {
            reject({ sent: false, msg: "Invalid Options" });
        }
    })
}
