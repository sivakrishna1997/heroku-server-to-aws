const nodemailer = require('nodemailer');
const xoauth2 = require('xoauth2');
require('dotenv').config();

// clientId: process.env.CLIENT_ID,
// clientSecret: process.env.CLIENT_SECRET

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL,
//         pass: process.env.EMAIL_PASSWORD  
//     }
// })


module.exports = {
    sentMail: sentMail
}

function sentMail(to, subject, options) {
    return new Promise((resolve, reject) => {
        if(!!to && !!subject) {
            let smtpTransport = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                // service: 'gmail',
                auth: {
                    user: 'aaimentr@gmail.com',
                    pass: 'madatakaja1A'
                    // user: 'dupilicatenodemailer@gmail.com',
                    // pass: 'nodemail@123'
                }
            });
            
            // var smtpTransport = nodemailer.createTransport({
            //     service: 'Gmail',
            //     auth: {
            //         user: 'dupilicatenodemailer@gmail.com',
            //         pass: 'nodemail@123'
            //     }
            // });

            let mailOpts = {
                from: '"Aimentr Verification mail" <aaimentr@gmail.com>',
                to: to ,
                // to: "krishna88861@gmail.com" ,
                subject : subject
            }
            console.log("SENT MAIL:: ", mailOpts.from, to, subject);
            if(options.html) {
                mailOpts.html = options.html;
            }else if(options.text) {
                mailOptions.text = "URL will be replaced here..";
            }else {
                console.log("body not sent!!");
            }
            smtpTransport.sendMail(mailOpts, (err, res) => {
                if(err) {
                    reject({sent: false, err: err});
                }else {
                    resolve({sent: true, msg: "Mail Sent!!"});
                }
            })
        }else {
            reject({sent: false, msg: "Invalid Options"});
        }
    })
}
