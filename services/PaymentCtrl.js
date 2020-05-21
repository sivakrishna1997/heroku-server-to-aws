var config = require('../config/payumoney');
// var payumoney = require('payumoney-node');
// payumoney.setKeys(config.MERCHANT_KEY, config.MERCHANT_SALT, config.AUTHORIZATION_HEADER);
// payumoney.isProdMode(true);

var payumoney = require('payumoney_nodejs');
payumoney.setProdKeys(config.MERCHANT_KEY, config.MERCHANT_SALT, config.AUTHORIZATION_HEADER);
payumoney.setSandboxKeys(config.MERCHANT_KEY, config.MERCHANT_SALT, config.AUTHORIZATION_HEADER);
payumoney.isProdMode(true);


var PaymentUserDetails = require('../models/PaymentSchema').model('PaymentUserDetails');
// var GSTcollection = require('./paymentSchema').model('GSTcollection');
var BeforePaidPaymentDetails = require('../models/PaymentSchema').model('BeforeGotoPayment_UserDetails');
var response = require('../response/response');

var paymentCtrl = {};



paymentCtrl.makePayment = (req, res) => {

    var params = req.body;

    var transactionId = Date.now();
    var paymentData = {
        productinfo: params.courseName,
        txnid: transactionId,
        amount: params.amount,
        email: params.email,
        phone: params.mobile,
        lastname: params.lastname,
        firstname: params.firstname,
        surl: params.SuccessUrl + `/${transactionId}`,
        furl: params.FailedUrl + `/${transactionId}`,
        AddressLine_1: "",
        // AddressLine_2: params.Address,
    };

    var findquery = {
        email: params.email,
        courseId: params.courseId
    }
    try {
        PaymentUserDetails.find(findquery).then(
            doc => {
                if (doc.length == 0) {
                    payumoney.pay(paymentData, function (err, resp) {
                        if (err) {

                            console.log("===>", err)
                            response(res, null, err);

                        } else {
                            console.log("payment Gateway resp =====url====>", resp);
                            if (resp) {
                                var query = {
                                    username: params.username,
                                    email: params.email,
                                    mobile: params.mobile,
                                    firstname: params.firstname,
                                    lastname: params.lastname,
                                    courseId: params.courseId,
                                    courseName: params.courseName,
                                    amount: params.amount,
                                    TransactionId: transactionId,
                                }

                                BeforePaidPaymentDetails.insertMany(query).then(
                                    doc => {
                                        data = {
                                            Data: doc,
                                            Message: "",
                                            Other: {
                                                Url: resp,
                                            }
                                        }
                                        // console.log(data)
                                        response(res, data, null);
                                    }, err => {
                                        response(res, null, err);
                                    }
                                )
                            } else {
                                error = {
                                    code: 11000,
                                    message: "Payment Failed!",
                                }
                                response(res, null, error);
                            }

                        }
                    });
                } else {
                    var data = {
                        Data: doc,
                        Message: "Already you have this Course !"
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


paymentCtrl.getBeforePaidPaymentDetails = (req, res) => {
    var params = req.body;
    var query = {
        TransactionId: params.TransactionId
    }
    try {
        BeforePaidPaymentDetails.find(query).then(
            doc => {
                data = {
                    Data: doc,
                    Message: ""
                }
                response(res, data, null);

            }, err => {
                response(res, null, err);
            }
        )
    } catch (err) {
        response(res, null, err);
    }
}


paymentCtrl.DeleteBeforePaidPaymentDetails = (req, res) => {
    var params = req.body;
    var query = {
        TransactionId: params.TransactionId
    }
    try {
        BeforePaidPaymentDetails.deleteMany(query).then(
            doc => {
                if (doc.n == 0) {
                    var data = {
                        Data: doc,
                        Message: params.TransactionId + "Record Deleting Failed !"
                    }
                } else {
                    var data = {
                        Data: doc,
                        Message: params.TransactionId + "Record Deleted Successfully !"
                    }
                }
                response(res, data, null);
            }, err => {
                response(res, null, err);
            }
        )
    } catch (err) {
        response(res, null, err);
    }
}




paymentCtrl.InsertPaymentDetails = function (req, res) {
    let params = req.body;
    var findquery = {
        email: params.email,
        courseId: params.courseId
    }
    try {
        PaymentUserDetails.find(findquery).then(
            doc => {
                if (doc.length == 0) {
                    let registerFields = new PaymentUserDetails(params);
                    registerFields.save(function (err, resp) {
                        if (err) {
                            response(res, null, err);
                        } else {
                            data = {
                                Data: resp,
                                Message: "Course added Successfully!"
                            }
                            response(res, data, null);
                        }
                    })
                } else {
                    var data = {
                        Data: doc,
                        Message: "You have Already this Course !"
                    }
                    response(res, data, null);
                }
            }, err => {
                response(res, null, err);
            })

    } catch (err) {
        response(res, null, err);
    }
}




paymentCtrl.DeletePaymentDetails = (req, res) => {
    var params = req.body;
    var query = {
        email: params.email,
        courseId: params.courseId
    }
    try {
        PaymentUserDetails.deleteOne(query).then(
            doc => {
                if (doc.n == 0) {
                    var data = {
                        Data: doc,
                        Message: "User Payment Record Deleting Failed !"
                    }
                } else {
                    var data = {
                        Data: doc,
                        Message: "User Payment Record Deleted Successfully !"
                    }
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



paymentCtrl.getPaidCourses = (req, res) => {
    var params = req.body;
    var query = {
        email: params.email
    }
    try {
        PaymentUserDetails.find(query).then(
            doc => {
                data = {
                    Data: doc,
                    Message: ""
                }
                response(res, data, null);

            }, err => {
                response(res, null, err);
            }
        )
    } catch (err) {
        response(res, null, err);
    }
}


paymentCtrl.getPaidUsers = function (req, res) {
    var params = req.body;
    var query = {};
    if (params.email) {
        query.email = params.email
    }
    if (params.mobile) {
        query.$where = `/^${params.mobile}.*/.test(this.mobile)`
    }
    if (params.courseId) {
        query.courseId = params.courseId
    }
    try {
        PaymentUserDetails.find(query).then(
            doc => {
                data = {
                    Data: doc,
                    Message: ""
                }
                response(res, data, null);
            },
            err => {
                response(res, null, err);
            })
    } catch (err) {
        response(res, null, err);
    }
}








// paymentCtrl.insertGSTAndUpdate = (req, res) => {
//     var params = req.body;
//     var query = {
//         GSTrate: params.GSTrate
//     }
//     try {
//         GSTcollection.find({}).then(
//             doc => {
//                 if (doc.length == 0) {
//                     let registerFields = new GSTcollection(params);
//                     registerFields.save(function (err, resp) {
//                         if (err) {

//                             response(res, null, err);

//                         } else {

//                             var data = {
//                                 Data: resp,
//                                 Message: "GST Inserted Successfully !"
//                             }
//                             response(res, data, null);
//                         }
//                     })
//                 } else {

//                     GSTcollection.updateOne({ _id: doc[0]._id }, {
//                         $set: query
//                     }).then(
//                         Subdoc => {

//                             if (Subdoc.n == 0) {
//                                 var data = {
//                                     Data: Subdoc,
//                                     Message: "GST Updating Failed !"
//                                 }
//                             } else {
//                                 var data = {
//                                     Data: Subdoc,
//                                     Message: "GST Updated Successfully !"
//                                 }
//                             }

//                             response(res, data, null);

//                         }, err => {

//                             response(res, null, err);

//                         }
//                     )
//                 }
//             }, err => {
//                 response(res, null, err);
//             })
//     } catch (err) {
//         response(res, null, err);
//     }
// }

// paymentCtrl.getGSTRate = (req, res) => {
//     var params = req.body;
//     try {
//         GSTcollection.find({}).then(
//             doc => {
//                 var data = {
//                     Data: doc,
//                     Message: ""
//                 }
//                 response(res, data, null);

//             }, err => {
//                 response(res, null, err);
//             }
//         )
//     } catch (err) {
//         response(res, null, err);
//     }

// }








module.exports = paymentCtrl;