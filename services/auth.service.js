const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const multer = require('multer');
const otpGenerator = require('otp-generator');
const request = require('request');

var fs = require('fs')
var textract = require('textract');
const pdfparse = require('pdf-parse');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname)
    }
})

// const mailer = require('../_helpers/mailer');
// const mailer = require('../_helpers/mail');
const mailer = require('../_helpers/mailgun');

// Config
const dbConfig = require('../config/database');

// Formatters
const commonFormatter = require('../formatters/common.formatter');

// Models
const User = require('../models/users');
const UserVerification = require('../models/user-verification');

var service = {
    validUsername: validUsername,
    registerUser: registerUser,
    authenticateUser: authenticateUser,
    resetPassword: resetPassword,
    extractResume: extractResume,
    mailVerified: mailVerified,
    getMailVerificationStatus: getMailVerificationStatus,
    resendConfirmation: resendConfirmation,
    sendOtp: sendOtp,
    verifyOtp: verifyOtp,
    studentRegistration: studentRegistration
}

module.exports = service;


function sendOtp(req, res, next) {
    // let otp = otpGenerator.generate(6, { alphabets: false, upperCase: false, specialChars: false });

    // let token = req.body.token;
    // let tokenPayload = jwt.verify(token.split(' ')[1], dbConfig.secret);
    // let tokenPayload = jwt.verify(token.split(' ')[1], dbConfig.secret);

    var params = req.body.payload
    let otp = params.otp;
    let date = new Date();
    let expDate = new Date(date.getTime() + (30 * 60000))


    var obj = {
        email: params.Email,
        username: params.username,
        otp: otp,
        // expiresOn: expDate.getFullYear() + ',' + expDate.getMonth() + ',' + expDate.getDate() + ',' + expDate.getHours() + ',' + expDate.getMinutes(),
        expiresOn: expDate
    }

    UserVerification.FindUserVerificationCompleted(params.Email,
        (err, verifyUser) => {
            if (err) {
                return res.json({ success: false, message: "Something went wrong", error: err });
            } else if (verifyUser.length > 0) {
                return res.json({ success: false, message: "Email already exist! Please login", error: err });
            } else {
                UserVerification.FindUser(params.Email,
                    (err, users) => {
                        if (err) {
                            return res.json({ success: false, message: "Something went wrong", error: err });
                        } else if (users.length > 0) {

                            UserVerification.UpdateUserOtp(obj, (err, savedOtp) => {

                                if (err) {
                                    return res.json({ success: false, message: 'Something went wrong' + err.message, error: err });
                                } else {
                                    let html = params.html;

                                    return res.json({ success: true, message: 'Sent verification mail.', Data: params });

                                    // mailer.sentMail(params.Email, "Aimentr Verification Mail", { html }).then(
                                    //     (success) => {
                                    //         res.send({ success: true, message: 'Sent verification mail.', Data: params });
                                    //     }, (err) => {
                                    //         res.send({ success: false, message: 'Failed to sent mail.' + err.message });
                                    //     })
                                }
                            });

                        } else {
                            UserVerification.SaveUserData(obj,
                                (err, savedOtp) => {
                                    if (err) {
                                        return res.json({ success: false, message: 'Something went wrong' + err.message, error: err });
                                    } else {
                                        let html = params.html;

                                        return res.json({ success: true, message: 'Sent verification mail.', Data: params });

                                        // mailer.sentMail(params.Email, "Aimentr Verification Mail", { html }).then(
                                        //     (success) => {
                                        //         res.send({ success: true, message: 'Sent verification mail.', Data: params });
                                        //     }, (err) => {
                                        //         res.send({ success: false, message: 'Failed to sent mail.' + err.message });
                                        //     })
                                    }
                                });

                        }
                    })
            }
        }
    )






    // UserVerification.SaveUserData(obj,
    //     (err, savedOtp) => {
    //         if (err) {
    //             return res.status(500).json({ success: false, message: 'Something went wrong' + err.message, error: err });
    //         } else {
    //             let html = params.html;
    //             mailer.sentMail(params.Email, "Aimentr Verification Mail", { html }).then(
    //                 (success) => {
    //                     res.status(200).send({ success: true, message: 'Sent verification mail.', Data: params });
    //                 }, (err) => {
    //                     res.status(200).send({ success: false, message: 'Failed to sent mail.' + err.message });
    //                 })
    //         }
    //     });


    // Save OTP to db
    // let verification = new UserVerification({
    //     email: params.Email,
    //     username: params.username,
    //     otp: otp,
    //     expiresOn: expDate.getFullYear() + ',' + expDate.getMonth() + ',' + expDate.getDate() + ',' + expDate.getHours() + ',' + expDate.getMinutes(),
    // })

    // verification.save().then(
    //     doc => {
    //         // UserVerification.Update(
    //         //     { username: params.username },
    //         //     { otp: otp, expiresOn: expDate.getFullYear() + ',' + expDate.getMonth() + ',' + expDate.getDate() + ',' + expDate.getHours() + ',' + expDate.getMinutes() },
    //         //     { upsert: true },
    //         //     (err, savedOtp) => {
    //         //         if (err) {
    //         //             return res.status(500).json({ success: false, message: 'Something went wrong', error: err });
    //         //         } else {
    //         let html = params.html;
    //         mailer.sentMail(params.Email, "Aimentr Verification Mail", { html }).then(
    //             (success) => {
    //                 res.status(200).send({ success: true, message: 'Sent verification mail.' });
    //             }, (err) => {
    //                 res.status(200).send({ success: false, message: 'Failed to sent mail.' + err.message });
    //             })
    //         // }
    //         // });
    //     }, err => {
    //         res.status(200).send({ success: false, message: err.message });
    //     }
    // )


}







function verifyOtp(req, res, next) {
    let otp = req.body.otp;
    let email = req.body.email;

    if (!!otp && !!email) {
        UserVerification.isValidOtp(email, otp, (err, otpInfo) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Something went wrong", error: err });
            } else if (otpInfo.length > 0) {
                // let expDate = otpInfo[0].expiresOn ? [...otpInfo[0].expiresOn.split(',')] : null;
                // return res.status(200).json({ success: true, message: 'Verified Successfully', data: otpInfo, });
                UserVerification.mailVerified(email,
                    (err, verifyedInfo) => {
                        if (err) {
                            return res.status(500).json({ success: false, message: "Something went wrong", error: err });
                        }
                        return res.status(200).json({ success: true, message: 'Verified Successfully', data: otpInfo, });
                    }
                )
            } else {
                return res.status(200).json({ success: false, message: 'Invalid OTP' });
            }
        })

        // res.status(200).json({success: true, message: 'Verifying OTP!!', data: req.body});
    } else {
        res.status(400).json({ success: false, message: 'Bad Request' });
    }

}


function getMailVerificationStatus(req, res, next) {
    let username = req.params.username;
    // console.log("Username")
    User.getMailVerificationStatus(username, (err, user) => {
        console.log(err);
        if (err) {
            return res.status(500).json({ success: false, msg: "Something went wrong", err: err });
        } else {
            return res.status(200).send({ success: true, msg: 'Verification Status', data: user });
        }
    })
}

function mailVerified(req, res, next) {
    let username = req.params.username;
    User.mailVerified(username, (err, isUpdated) => {
        if (err) {
            return res.status(500).json({ success: false, msg: "Something went wrong", err: err });
        } else if (!!isUpdated) {
            return res.status(200).json({ success: true, msg: "Mail Verified Successfully" });
        } else {
            return res.status(500).json({ success: false, msg: "Failed to update" });
        }
    })
}






function extractResume(req, res, next) {
    const file = req.file;
    console.log('REEQ BODY =>', req.headers.host)
    if (!file) {
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
        return next(error)
    }

    try {
        console.log(req.body);
        var params = req.body;

        if (req.body.filetype == "pdf") {
            console.log("pdf")
            var pdfFilePath = fs.readFileSync(params.filepath)
            pdfparse(pdfFilePath).then(
                doc => {
                    // console.log(doc.text);
                    req.body.DocText = doc.text;
                    CreateAtextFile(req, res);
                }, err => {
                    console.log(err);
                    response(res, null, error);
                }
            )
        } else {
            var config = {
                preserveLineBreaks: true,
                preserveOnlyMultipleLineBreaks: true
            }
            textract.fromFileWithPath(params.filepath, config, function (error, text) {
                if (error) {
                    console.log(error)
                    response(res, null, error);
                } else {
                    // console.log(text);
                    req.body.DocText = text;
                    CreateAtextFile(req, res, next);
                }
            })

        }

    } catch (err) {
        response(res, null, err);
        console.log("--------err-------------");
    }


}


function CreateAtextFile(req, res, next) {
    var params = req.body;
    var ourTextFileName = Date.now() + "text"
    fs.appendFile('./public/upload/' + ourTextFileName, params.DocText, function (err) {
        if (err) {
            console.log(err);
            response(res, null, error);
        } else {
            console.log('Saved!');

            req.body.textFilePath = '/public/upload/' + ourTextFileName + '.txt';

            fs.unlink(params.filepath, function (err) {
                if (err) throw err;
                console.log('File deleted!');
            });

            resumeExtraction(req, res, next);

        }
    });
}



function resumeExtraction(req, res, next) {
    var newfilePath = req.protocol + '://' + req.get('host') + req.body.textFilePath;
    var requestUrl = 'https://resu-api.herokuapp.com/get_file?files=' + newfilePath

    // var newfilePath = req.protocol + '://' + req.get('host') + '/public/upload' + 
    // var requestUrl = 'https://resu-api.herokuapp.com/get_file?files=' + 'https://res.cloudinary.com/niteoit-solutions/raw/upload/v1576841420/resume/obul_s9en6x.txt'

    // var requestUrl = "https://res.cloudinary.com/niteoit/raw/upload/v1586603929/pradeep.docx_x3zfaa.txt"
    request.get(requestUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log("body", body);
            var ExtractData = JSON.parse(body);
            // sendingMail(req, res);
            var mail = ExtractData.Email[0];
            getUserNameFromMail = mail.split("@");
            console.log(getUserNameFromMail)
            let usernameEndingNumber = otpGenerator.generate(3, { alphabets: false, upperCase: false, specialChars: false });
            let otp = otpGenerator.generate(6, { alphabets: false, upperCase: false, specialChars: false });
            console.log("otp====>", otp)
            req.body.payload = {
                username: getUserNameFromMail[0] + usernameEndingNumber,
                Email: ExtractData.Email[0],
                MobileNumber: ExtractData.phone[0],
                Context: ExtractData.Context[0],
                Company: ExtractData.Company,
                Experience: ExtractData.Exp_date,
                otp: otp,
                html: ""
            }

            CreatemailTemplate(req, res, next)

        } else {
            console.log("err", error)
        }
    })
}


function studentRegistration(req, res, next) {

    var params = req.body;
    var mail = params.email;
    getUserNameFromMail = mail.split("@");
    console.log(getUserNameFromMail)
    let usernameEndingNumber = otpGenerator.generate(3, { alphabets: false, upperCase: false, specialChars: false });
    let otp = otpGenerator.generate(6, { alphabets: false, upperCase: false, specialChars: false });

    req.body.payload = {
        username: getUserNameFromMail[0] + usernameEndingNumber,
        Email: params.email,
        MobileNumber: null,
        Context: null,
        Company: null,
        Experience: null,
        otp: otp,
        html: ""
    }

    CreatemailTemplate(req, res, next)


}



function CreatemailTemplate(req, res, next) {

    req.body.payload.html = `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation Mail</title>
    <style>
    </style>
    </head>
    
    <body link="#00a5b5" vlink="#00a5b5" alink="#00a5b5">
    
    <table class=" main contenttable" align="center"
        style="font-weight: normal;border-collapse: collapse;border: 0;margin-left: auto;margin-right: auto;padding: 0;font-family: Arial, sans-serif;color: #555559;background-color: white;font-size: 16px;line-height: 26px;width: 600px;">
        <tr>
            <td class="border"
                style="border-collapse: collapse;border: 1px solid #eeeff0;margin: 0;padding: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;">
                <table
                    style="font-weight: normal;border-collapse: collapse;border: 0;margin: 0;padding: 0;font-family: Arial, sans-serif;">
                    <tr>
                        <td colspan="4" valign="top" class="image-section"
                            style="border-collapse: collapse;border: 0;margin: 0;padding: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;background-color: #fff;border-bottom: 4px solid #00a5b5">
                            <a href="https://tenable.com"><img class="top-image"
                                    src="https://res.cloudinary.com/niteoit/image/upload/v1587846012/logo_full_mj3px6.png"
                                    style="line-height: 3;width: 25%;" alt="AIMentr"></a>
                        </td>
                    </tr>
                    <tr>
                        <td valign="top" class="side title"
                            style="border-collapse: collapse;border: 0;margin: 0;padding: 20px;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;vertical-align: top;background-color: white;border-top: none;">
                            <table
                                style="font-weight: normal;border-collapse: collapse;border: 0;margin: 0;padding: 0;font-family: Arial, sans-serif;">
                                <tr>
                                    <td class="head-title"
                                        style="border-collapse: collapse;border: 0;margin: 0;padding: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 28px;line-height: 34px;font-weight: bold; text-align: center;">
                                        <div class="mktEditable" id="main_title">
                                           Welcome Abroad
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="sub-title"
                                        style="border-collapse: collapse;border: 0;margin: 0;padding: 0;padding-top:5px;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 18px;line-height: 29px;font-weight: bold;text-align: center;">
                                        <div class="mktEditable" id="intro_title">
                                            We are Happy to have you with us 
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="top-padding"
                                        style="border-collapse: collapse;border: 0;margin: 0;padding: 5px;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;">
                                    </td>
                                </tr>
                                <tr>
                                    <td class="grey-block"
                                        style="border-collapse: collapse;border: 0;margin: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;background-color: #fff; text-align:center;">
                                        <div class="mktEditable" id="cta">
                                            <p>
                                                Thank you for Siging up with AIMentr,Be sure to use the email address where you'd like to receive messages, invitations, requests, or other email when you do.
     
                                                <br><br><strong>Please verify your Email Address by Typing <br>OTP in registration Process</strong> <br>
                                                The AIMentr Team <br><br>
                                            </p>
                                            
                                            <a style="color:#ffffff; background-color: #e43a3a;  border: 10px solid #e43a3a; border-radius: 3px; text-decoration:none;"
                                                href="#">
                                               OTP - ${req.body.payload.otp}
                                               
                                                
                                                </a>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
    
                    <tr bgcolor="#fff" style="border-top: 4px solid #00a5b5;">
                        <td valign="top" class="footer"
                            style="border-collapse: collapse;border: 0;margin: 0;padding: 0;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 16px;line-height: 26px;background: #fff;text-align: center;">
                            <table
                                style="font-weight: normal;border-collapse: collapse;border: 0;margin: 0;padding: 0;font-family: Arial, sans-serif;">
                                <tr>
                                    <td class="inside-footer" align="center" valign="middle"
                                        style="border-collapse: collapse;border: 0;margin: 0;padding: 20px;-webkit-text-size-adjust: none;color: #555559;font-family: Arial, sans-serif;font-size: 12px;line-height: 16px;vertical-align: middle;text-align: center;width: 580px;">
                                        <div id="address" class="mktEditable">
                                            <b>AIMentr Social Learning Network</b><br>
                                            Product of Right workz<br> 
                                            <a style="color: #00a5b5;"
                                                href="https://www.rightworkz.com/contact">Contact Us</a>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    </body>
    
    </html>
        `
    sendOtp(req, res, next)
}





function validUsername(req, res, next) {
    let username = req.params.username;
    User.getUserByUsername(username, (err, user) => {
        if (err) {
            return res.status(500).send({ success: false, msg: "Something went wrong..Please try again" });
        } else if (!user) {
            return res.status(200).send({
                success: true,
                valid: true,
                msg: "Valid Username"
            });
        } else {
            return res.status(500).send({
                success: true,
                valid: false,
                msg: "Username already exists"
            })
        }
    })
}

/**
 *
 * Function to Register User info.
 *
 * @param {request} req
 * @param {response} res
 * @param {middlewares} next
 */
function registerUser(req, res, next) {
    var params = req.body;
    // let user = new User({
    //     username: req.body.username,
    //     password: req.body.password,
    //     role: req.body.role,
    //     profileUpdated: false,
    //     verified: false,
    //     isActive: false,
    //     signInMethod: 'local', //TODO: It Will come dynamic in future.
    //     personal: {
    //         mail: req.body.mail,
    //         gender: null,
    //         mobile: null,
    //         about: null,
    //         dob: null,
    //         location: null
    //     }
    // });

    let user = new User({
        email: params.email,
        username: params.username,
        firstname: params.firstname,
        lastname: params.lastname,
        password: params.password,
        role: params.role,
        personal: {
            gender: params.personal.gender,
            mobile: params.personal.mobile,
            about: params.personal.about,
            dob: params.personal.dob,
            location: params.personal.location,
            mail: params.personal.mail,
        },
        education: {
            college: params.education.college,
            degree: params.education.degree,
            graduationYear: params.education.graduationYear,
            skills: params.education.skills,
        },
        work: {
            experienceLevel: params.work.experienceLevel,
            experiences: params.work.experiences,
            context: params.work.context,
            yearsOfExperience: params.work.yearsOfExperience
        },
        analysis: {},
        training: {},
        mentor: {
            timings: {
                start: params.mentor.timings.start,
                end: params.mentor.timings.end,
            },
            languagesTeach: params.mentor.languagesTeach,
            context: params.mentor.context,
            classification: [],
            jobType: params.mentor.jobType,
            avgCost: params.mentor.avgCost,
            reputation: params.mentor.reputation,
        },
        learningAssets: {
            interestedAreas: params.learningAssets.interestedAreas,
            financialAid: params.learningAssets.financialAid,
            isOpportunities: params.learningAssets.isOpportunities,
            opportunityType: params.learningAssets.opportunityType,
        }
    });
    // const token = jwt.sign({id: req.body.username}, dbConfig.secret, {
    //     expiresIn: 600 // expires in 1 hour
    // })
    // const link = 'http://localhost:9009/profile?id='+token;
    // var html = 'Hello'+req.body.username+',<br> Please Click on the link to verify your email.<br><a href='+link+' target="_blank">Click here to verify</a>';
    // mailer.sentMail(req.body.mail, "Conmentr Verification Mail", {html}).then((result) => {
    //    return  res.status(200).send({success: true, msg: 'User added successfully.Sent verification mail.', result: result});
    // }, (err) => {
    //     return res.status(200).send({success: true, msg: 'User added successfully.Failed to sent mail.', result: result});
    // })


    // let user = new User(req.body);
    User.getUserByUsername({ email: params.email, username: params.username, }, (err, result) => {
        if (err) {
            next();
        } else {
            if (!result) {
                User.addUser(user, (err, result) => {
                    if (err) {
                        // console.log(err);
                        res.send({ success: false, msg: "User Already exist please login", error: err });
                    }
                    if (!!result) {
                        const token = jwt.sign({ id: result['_id'], username: result['username'], mail: result.personal.mail }, dbConfig.secret, {
                            expiresIn: 3600 // expires in 10 mins
                        })
                        // const link = 'http://localhost:9009/auth/profile/'+(user.role == 2 ? 'mentor' : 'student')+'?id='+token;
                        // const link = `http://aimentr.com/auth/profile/${(user.role == 2 ? 'mentor' : 'student')}?id=${token}`;
                        // var html = 'Hello'+req.body.username+',<br> Please Click on the link to verify your email.<br><a href='+link+' target="_blank">Click here to verify</a>';
                        // mailer.sentMail(result.personal.mail, "Conmentr Verification Mail", {html}).then((success) => {
                        //     res.status(200).send({success: true, msg: 'User added successfully. Sent verification mail.',token: 'JWT '+token, user: result});
                        // }, (err) => {
                        //     res.status(200).send({success: true, msg: 'User added successfully.Failed to sent mail.', user: result});
                        // })


                        res.send({ success: true, msg: 'User added successfully', token: 'JWT ' + token, user: result });
                    } else {
                        res.send({ success: false, msg: "Failed to add data to db.. Please try again" + err.message });
                    }
                })
            } else {
                res.send({ success: false, msg: "Username already exists" });
            }
        }
    })

}

/**
 * Function to Authenticate the login info
 *
 * @param {request} req
 * @param {response} res
 * @param {middlewares} next
 */

function authenticateUser(req, res, next) {
    var params = req.body;
    let email = req.body.email;
    let password = req.body.password;
    User.getUserByUsername({ email: params.email }, (err, user) => {
        if (err) {
            return res.json({ success: false, msg: "Something went wrong" });
        } else if (!user) {
            return res.json({ success: false, msg: "User Not Found" });
        } else {
            User.comparePassword(password, user.password, (err2, isMatch) => {
                if (err2) throw err2;
                if (!isMatch) {
                    return res.json({ success: false, msg: "Password doesn't match" });
                } else {
                    const token = jwt.sign({ id: user['_id'], username: user['username'], mail: user.personal.mail }, dbConfig.secret, {
                        expiresIn: 3600 // expires in 1 hour
                    })
                    res.json({
                        success: true,
                        token: 'JWT ' + token,
                        user: user
                    })
                }
            })
        }
    })
}

function resendConfirmation(req, res, next) {
    let username = req.params.username;
    User.getUserByUsername(username, (err, user) => {
        if (err) {
            return res.status(500).send({ success: false, msg: "Something went wrong", err: err });
        } else {
            const token = jwt.sign({ username: user.username }, dbConfig.secret, {
                expiresIn: 600 // expires in 10 mins
            })
            // const link = 'http://localhost:9009/auth/profile/'+(user.role == 2 ? 'mentor' : 'student')+'?id='+token;
            const link = `http://aimentr.com/auth/profile/${(user.role == 2 ? 'mentor' : 'student')}?id=${token}`;
            var html = 'Hello ' + user.username + ',<br> Please Click on the link to verify your email.<br><a href=' + link + ' target="_blank">Click here to verify</a>';

            mailer.sentMail(user.personal.mail, "Conmentr Verification Mail", { html }).then((success) => {
                res.status(200).send({ success: true, msg: 'Sent verification mail.' });
            }, (err) => {
                res.status(200).send({ success: true, msg: 'Failed to sent mail.', err: err });
            })

        }
    })
}


function resetPassword(req, res, next) {

}
