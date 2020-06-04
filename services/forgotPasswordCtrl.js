var ForgotUsernamePassword = require('../models/forgotPasswordSchema');
var response = require('../response/response');
var moment = require('moment');


const mailer = require('../_helpers/mailgun');


ForgotCtrl = {};




ForgotCtrl.SendPasswordUrl = (req, res) => {

    var params = req.body;
    var UrlId = Date.now();
    var query = {
        UrlId: UrlId,
        Email: params.email,
        DateAndTime: new Date()
    }

    var InputFields = new ForgotUsernamePassword(query);
    try {
        InputFields.save().then(
            doc => {
                req.body.Data = doc;
                // ForgotCtrl.SendUrlToMail(req, res);

                // var Url = "http://localhost:4200/forgotpassword/" + params.Data.UrlId;
                var Url = '/forgotpassword/' + params.Data.UrlId;

                var data = {
                    Data: Url,
                    Message: "A Url sent to your mail for reset password"
                }
                response(res, data, null);

            }, err => {
                response(res, null, err)
            }
        )
    } catch (err) {
        response(res, null, err);
    }

}



ForgotCtrl.SendUrlToMail = (req, res) => {
    // console.log(req.body);
    var params = req.body;

    var Url = "http://localhost:4200/forgotpassword/" + params.Data.UrlId

    // var Url = "https://aimentr.com/forgotpassword/" + params.Data.UrlId;

    var html = `<a href="${Url}">Click Here</a> For reset your password`


    mailer.sentMail(params.email, "Aimentr Forgot Password Mail", { html }).then(
        (success) => {
            // res.send({ success: true, message: 'Sent verification mail.', Data: params });
            var data = {
                Data: [],
                Message: "A Url sent to your mail for reset password"
            }
            response(res, data, null);

        }, (err) => {
            response(res, null, err)
        })


}




ForgotCtrl.GetForgotPasswordUrl = (req, res) => {
    var params = req.body;
    var query = {};
    if (params.UrlId) {
        query.UrlId = params.UrlId;
    }
    if (params.Email) {
        query.Email = params.Email;
    }

    try {
        ForgotUsernamePassword.find(query).then(
            doc => {
                var data = {
                    Data: doc,
                }
                response(res, data, null);
            }, err => {
                response(res, null, err)
            }
        )
    } catch (err) {
        response(res, null, err);
    }
}








ForgotCtrl.CheckUrlIsValid = (req, res) => {
    var params = req.body;
    var query = {};
    if (params.UrlId) {
        query.UrlId = params.UrlId;
    }

    try {
        ForgotUsernamePassword.findOne(query).then(
            doc => {
                // console.log(doc);
                if (doc) {
                    var ExpireTime = moment(doc.DateAndTime).add(60, 'minutes');
                    var correntTime = moment(new Date());
                    // console.log("ExpireTime", ExpireTime);
                    // console.log("correntTime", correntTime);
                    isExpire = moment(ExpireTime).isAfter(moment(correntTime));
                    // console.log("isExpire", isExpire);
                    var data = {};
                    if (isExpire) {
                        data = {
                            Data: doc,
                            Message: "Url is Valid!",
                            Other: {
                                Success: true
                            }
                        }
                    } else {
                        data = {
                            Data: doc,
                            Message: "Url is Expire!",
                            Other: {
                                Success: false
                            }
                        }
                    }

                    response(res, data, null);
                } else {

                    data = {
                        Data: doc,
                        Message: "Url is NotValid!",
                        Other: {
                            Success: false
                        }
                    }

                    response(res, data, null);
                }


            }, err => {
                response(res, null, err)
            }
        )
    } catch (err) {
        response(res, null, err);
    }

}






module.exports = ForgotCtrl;